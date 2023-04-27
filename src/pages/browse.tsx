import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Navbar } from "~/components/Navbar";
import { api } from "~/utils/api";

const Browse: NextPage = () => {
  const router = useRouter();
  const { data, isLoading } = api.shows.listTVShows.useQuery();

  const session = useSession({
    required: true,
    async onUnauthenticated() {
      await router.push("/api/auth/signin");
    },
  });
  if (!session.data) return <></>;

  return (
    <>
      <div className="h-screen bg-zinc-900">
        <main className="dark h-full  text-zinc-50">
          <Navbar user={session.data.user} />
          <div className="p-6">
            <div className="flex gap-32">
              <div>
                <h1 className="text-2xl">TV Shows</h1>
                <div className="flex gap-4 pt-5">
                  {isLoading && <p>Loading...</p>}
                  {data &&
                    data.map((show) => (
                      <div key={show.id}>
                        <Link href={`/shows/${show.title}`}>{show.title}</Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Browse;
