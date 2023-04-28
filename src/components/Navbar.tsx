import Link from "next/link";
import { useRouter } from "next/router";
import { type User } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface INavbarProps {
  user: User;
}

export const Navbar = ({ user }: INavbarProps) => {
  const router = useRouter();

  return (
    <>
      <div className="h-12">
        <div className="flex justify-between px-4 py-2">
          <div className="flex">
            <h1 className="text-xl text-slate-200">MFlix</h1>
            <Link
              className={`px-4 text-lg text-slate-200 ${
                router.route === "/browse" ? "font-bold" : ""
              }`}
              href={"/browse"}
            >
              Home
            </Link>
          </div>
          <div>
            <Avatar>
              <AvatarImage src={user.image as string} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </>
  );
};
