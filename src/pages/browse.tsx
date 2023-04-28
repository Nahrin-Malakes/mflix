import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
      <div className="h-screen ">
        <main className="h-full">
          <Navbar user={session.data.user} />
          <div className="p-6">
            <div className="flex gap-32">
              <div>
                <h1 className="text-2xl">TV Shows</h1>
                <div className="flex gap-4 pt-5">
                  {isLoading && <p>Loading...</p>}
                  {data &&
                    data.map((show) => (
                      <div className="flex gap-4" key={show.id}>
                        <Link href={`/shows/${show.title}`}>
                          <Image
                            className="rounded-md"
                            width={300}
                            height={150}
                            alt={show.title}
                            src={show.imageUrl}
                          />
                        </Link>
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
