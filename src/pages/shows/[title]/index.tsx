import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { Navbar } from "~/components/Navbar";
import { SeasonSelect } from "~/components/SeasonSelect";
import { api } from "~/utils/api";

const TVShow: NextPage = () => {
  const router = useRouter();
  const { data } = api.shows.getShow.useQuery({
    title: router.query.title as string,
  });
  const [season, setSeason] = useState("1");
  const { data: eps } = api.shows.getEpisodesOfSeason.useQuery(
    {
      seasonId: data?.show.seasons[Number(season) - 1]?.id as string,
      showId: data?.show.id as string,
    },
    {
      enabled: data?.show !== undefined,
    }
  );
  const session = useSession({
    required: true,
    async onUnauthenticated() {
      await router.push("/api/auth/signin");
    },
  });
  if (!session.data) return <></>;

  console.log(eps);

  return (
    <div className="h-screen bg-zinc-900">
      <main className="dark h-full  text-zinc-50">
        <Navbar user={session.data.user} />
        <div className="p-6">
          <div className="flex gap-32">
            <div className="flex gap-4">
              {/* <h1 className="text-3xl">
                {router.query.title} - {data?.seasons} Seasons
              </h1> */}
              {data && data.seasons && (
                <SeasonSelect setSeason={setSeason} seasons={data.seasons} />
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl">Episodes</h3>
          <div className="flex flex-col">
            {eps &&
              eps.map((ep, index) => (
                <div className="pt-4" key={ep.id}>
                  <Link
                    href={`/shows/${router.query.title as string}/${
                      data?.show.seasons[Number(season) - 1]?.id as string
                    }/${ep.id}`}
                  >
                    Episode {index + 1}
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TVShow;
