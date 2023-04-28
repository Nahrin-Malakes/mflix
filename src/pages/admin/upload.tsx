import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { Navbar } from "~/components/Navbar";
import { AddShowDialog } from "~/components/AddShowDialog";
import { AddSeasonDialog } from "~/components/AddSeason";
import { UploadEpisodeDialog } from "~/components/UploadEpisode";

const Upload: NextPage = () => {
  const session = useSession({
    required: true,
  });
  if (
    (session &&
      session.status !== "loading" &&
      session.data.user.role !== "ADMIN") ||
    !session.data
  )
    return null;

  return (
    <div className="h-screen">
      <main className="dark h-full">
        <Navbar user={session.data.user} />
        <div className="flex p-6">
          <div className="flex gap-3">
            <AddShowDialog />
            <AddSeasonDialog />
            <UploadEpisodeDialog />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
