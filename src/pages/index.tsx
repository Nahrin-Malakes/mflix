import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>MFlix</title>
        <meta name="description" content="The new way of watching TV" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F15A59] to-[#D21312]">
        <h1 className="text-6xl font-bold text-red-300">
          The new way of watching TV
        </h1>
        <Link
          href="/api/auth/signin"
          className="mt-5 rounded-md bg-slate-400 px-6 py-4 text-slate-900"
        >
          Try now
        </Link>
      </main>
    </>
  );
};

export default Home;
