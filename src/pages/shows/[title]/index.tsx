import { Check, ChevronsUpDown } from "lucide-react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type Dispatch, type SetStateAction, useState } from "react";

import { Navbar } from "~/components/Navbar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

export function SeasonCombobox({
  title,
  setSeason,
}: {
  title: string;
  setSeason: Dispatch<SetStateAction<string>>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const { data } = api.shows.getShow.useQuery({
    title,
  });
  if (!data || !data.seasons) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data.seasons.find((season) => season.season === value)?.season
            : "Select season..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search season..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {data.seasons.map((season) => (
              <CommandItem
                key={season.id}
                onSelect={(currentValue) => {
                  setSeason(currentValue === value ? "" : currentValue);
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === season.season ? "opacity-100" : "opacity-0"
                  )}
                />
                {season.season}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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

  return (
    <div className="h-screen">
      <main className="dark h-full">
        <Navbar user={session.data.user} />
        <div className="p-6">
          <div className="flex gap-32">
            <div className="flex gap-4">
              {/* <h1 className="text-3xl">
                {router.query.title} - {data?.seasons} Seasons
              </h1> */}
              {data && data.seasons && (
                <SeasonCombobox
                  setSeason={setSeason}
                  title={router.query.title as string}
                />
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
