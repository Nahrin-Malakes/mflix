import { type RouterOutputs } from "~/utils/api";

export const UploadedObjects = ({
  objects,
}: {
  objects: RouterOutputs["s3"]["getObjects"];
}) => {
  if (!objects || objects.length === 0)
    return <div>No objects uploaded yet.</div>;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Uploaded Objects</h2>
      {objects.map((object) => (
        <div key={object.Key}>
          <a
            href={`https://t3-app-dropzone-example.s3.amazonaws.com/${
              object.Key as string
            }`}
            target="_blank"
            rel="noreferrer"
          >
            {object.Key}
          </a>
        </div>
      ))}
    </div>
  );
};
