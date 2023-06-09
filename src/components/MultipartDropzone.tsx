import { useCallback, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Button } from "./ui/button";

// determines the ideal file part size for multipart upload based on file's total size
const calculateChunkSize = (fileSize: number) => {
  const FiveGB = 5 * 2 ** 30;
  const FiveHundredGB = 500 * 2 ** 30;
  const FiveTB = 5 * 2 ** 40;
  if (fileSize <= FiveGB) {
    return 50 * 2 ** 20; // 50MB
  } else if (fileSize <= FiveHundredGB) {
    return 50 * 2 ** 20; // 50MB
  } else if (fileSize <= FiveTB) {
    return Math.ceil(FiveTB / 10000); // use the full 10k allowed parts
  }

  return 500 * 2 ** 20; // 500MB
};

const splitFileIntoParts = (file: File) => {
  const chunkSize = calculateChunkSize(file.size);
  const numberOfChunks = Math.ceil(file.size / chunkSize);
  let chunk = 0;
  const fileParts: File[] = [];
  while (chunk < numberOfChunks) {
    const chunkStart = chunk * chunkSize;
    const chunkEnd = Math.min(file.size, chunkStart + chunkSize);
    const filePartBlob = file.slice(chunkStart, chunkEnd);
    const filePartName = `CHUNK${chunk}-${file.name}`;
    const filePart = new File([filePartBlob], filePartName);
    fileParts.push(filePart);
    chunk += 1;
  }
  const partsAsObj: { [partNumber: number]: File } = {};
  for (let i = 1; i <= fileParts.length; i++) {
    partsAsObj[i] = fileParts[i - 1] as File;
  }
  return partsAsObj;
};

interface IEpisodeDropzoneProps {
  show: string;
  seasonId: string;
  season: string;
}

export const EpisodeDropzone = ({
  show,
  seasonId,
  season,
}: IEpisodeDropzoneProps) => {
  // presigned URLs for uploading each file part
  const [partPresignedUrls, setPartPresignedUrls] = useState<
    { url: string; partNumber: number }[]
  >([]);
  const [fileParts, setFileParts] = useState<{ [partNumber: number]: File }>(
    {}
  );
  const [uploadId, setUploadId] = useState<string>("");
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { mutateAsync: fetchPresignedUrls } =
    api.shows.getMultipartUploadPresignedUrl.useMutation();
  const { mutateAsync: completeUpload } =
    api.shows.completeMultipartUpload.useMutation();
  const fetchedShow = api.shows.getShow.useQuery({
    title: show,
  });

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      maxFiles: 1,
      maxSize: 5 * 2 ** 40, // roughly 5TB
      minSize: 1 * 2 ** 20, // 1MB -> S3 limitation
      multiple: false,
      onDropAccepted: (files) => {
        const file = files[0] as File;

        const parts = splitFileIntoParts(file);
        setFileParts(parts);

        if (!fetchedShow.data?.seasons) return;

        fetchPresignedUrls({
          key: `tv-shows/${show}/se-${season}/${file.name}`,
          filePartTotal: Object.keys(parts).length,
        })
          .then((response) => {
            if (response) {
              const urls = response.urls.map((data) => ({
                url: data.url,
                partNumber: data.partNumber,
              }));
              setPartPresignedUrls(urls);
              setUploadId(response.uploadId);
              setSubmitDisabled(false);
            }
          })
          .catch((error) => console.error(error));
      },
    });

  const files = useMemo(() => {
    if (!submitDisabled)
      return acceptedFiles.map((file) => (
        <li key={file.name}>
          {file.name} - {file.size} bytes
        </li>
      ));
    return null;
  }, [acceptedFiles, submitDisabled]);

  const handleSubmit = useCallback(async () => {
    const uploadPromises: Promise<{
      PartNumber: number;
      ETag: string;
    }>[] = [];
    if (acceptedFiles.length > 0) {
      const ep = (acceptedFiles[0] as File).name;
      const key = `tv-shows/${show}/se-${season}/${ep}`;
      for (const { url, partNumber } of partPresignedUrls) {
        const file = fileParts[partNumber] as File;
        uploadPromises.push(
          axios
            .put(url, file.slice(), {
              onUploadProgress(progressEvent) {
                console.log(
                  `part #${partNumber} upload progress: ${
                    progressEvent.loaded
                  } of ${progressEvent.total as number} bytes uploaded`
                );
              },
            })
            .then((response) => ({
              ETag: response.headers.etag as string, // Entity tag for the uploaded object
              PartNumber: partNumber,
            }))
        );
      }

      const awaitedUploads = await Promise.all(uploadPromises);

      await completeUpload({ parts: awaitedUploads, key, uploadId, seasonId });
      console.log("Successfully uploaded ", key);
      setSubmitDisabled(true);
    }
  }, [
    acceptedFiles,
    completeUpload,
    fileParts,
    partPresignedUrls,
    uploadId,
    season,
    seasonId,
    show,
  ]);

  return (
    <section>
      <div {...getRootProps()} className="dropzone-container">
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="flex h-full items-center justify-center font-semibold">
            <p>Drop the file here...</p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-semibold">
            <p>Drag n drop file here, or click to select files</p>
          </div>
        )}
      </div>
      <aside className="my-2">
        <h4 className="font-semibold text-zinc-400">Files pending upload</h4>
        <ul>{files}</ul>
      </aside>
      <Button
        onClick={() => void handleSubmit()}
        disabled={submitDisabled}
        className="submit-button"
      >
        Upload
      </Button>
    </section>
  );
};
