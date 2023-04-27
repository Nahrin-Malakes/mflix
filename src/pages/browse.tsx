import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { Navbar } from "~/components/Navbar";

const Browse: NextPage = () => {
  const router = useRouter();
  const session = useSession({
    required: true,
    async onUnauthenticated() {
      await router.push("/api/auth/signin");
    },
  });
  if (!session.data) return <></>;

  return (
    <>
      <div className="h-screen bg-neutral-800">
        <Navbar user={session.data.user} />
      </div>
    </>
  );
};

export default Browse;
