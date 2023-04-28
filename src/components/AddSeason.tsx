import { Check, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";

export function AddSeasonDialog() {
  const [isDialogOpen, setisDialogOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState("");
  const [season, setSeason] = useState("");

  const tvShows = api.shows.listTVShows.useQuery(undefined, {
    enabled: isDialogOpen,
  });
  const addSeason = api.shows.addSeason.useMutation();

  const handleSubmit = () => {
    tvShows.data?.filter((show) => {
      if (show.title.toLocaleLowerCase() === selectedShow) {
        addSeason.mutate({
          showId: show.id,
          season,
        });
      }
    });
  };

  return (
    <Dialog onOpenChange={(status) => setisDialogOpen(status)}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Season</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Season</DialogTitle>
          <DialogDescription>Adds a new season to a TV Show.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Command>
            <CommandInput placeholder="Search a TV Show..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Shows">
                {tvShows.data &&
                  tvShows.data.map((show) => (
                    <CommandItem
                      onSelect={(currentValue) => {
                        setSelectedShow(
                          currentValue === selectedShow ? "" : currentValue
                        );
                      }}
                      key={show.id}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedShow === show.title.toLocaleLowerCase()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {show.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4  items-center gap-4">
            <Label htmlFor="season" className="text-right">
              Season
            </Label>
            <Input
              id="season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            {addSeason.isLoading ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Add Season"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
