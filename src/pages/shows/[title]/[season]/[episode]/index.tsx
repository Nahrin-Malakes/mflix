import type { NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "~/utils/api";

const Episode: NextPage = () => {
  const router = useRouter();

  const { data: showData } = api.shows.getShow.useQuery({
    title: router.query.title as string,
  });
  const { data } = api.shows.getEpisodesOfSeason.useQuery(
    {
      seasonId: router.query.season as string,
      showId: showData?.show.id as string,
    },
    {
      enabled:
        router.query.season !== undefined && showData?.show !== undefined,
    }
  );

  console.log(data);

  const { data: episode } = api.shows.getEpisode.useQuery({
    episodeId: router.query.episode as string,
  });

  return (
    <div className="h-screen bg-zinc-900">
      <main className="dark flex h-full items-center justify-center text-zinc-50">
        {episode && (
          <video
            className="h-96 w-96"
            controls={true}
            src={`https://dj57s02b8t9q1.cloudfront.net/${episode.s3Key}`}
          ></video>
        )}
      </main>
    </div>
  );
};

export default Episode;
