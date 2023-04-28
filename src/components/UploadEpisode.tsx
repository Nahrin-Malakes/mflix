import { Check } from "lucide-react";
import { type ChangeEvent, useState } from "react";
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
import { api } from "~/utils/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { MultipartDropzone } from "./MultipartDropzone";

export function UploadEpisodeDialog() {
  const [isDialogOpen, setisDialogOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");

  const tvShows = api.shows.listTVShows.useQuery(undefined, {
    enabled: isDialogOpen,
  });
  const show = api.shows.getShow.useQuery(
    {
      title: selectedShow,
    },
    {
      enabled: isDialogOpen && selectedShow.length > 1,
    }
  );

  return (
    <Dialog onOpenChange={(status) => setisDialogOpen(status)}>
      <DialogTrigger asChild>
        <Button variant="outline">Upload Episode</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Episode</DialogTitle>
          <DialogDescription>Upload a new episode to a show.</DialogDescription>
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
        {selectedShow.length > 1 && show.data && (
          <div className="grid gap-4 py-4">
            <Command>
              <CommandInput placeholder="Search a season..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Seasons">
                  {show.data &&
                    show.data.seasons.map((season, index) => (
                      <CommandItem
                        onSelect={(currentValue) => {
                          setSelectedSeason(
                            currentValue === selectedSeason ? "" : currentValue
                          );
                        }}
                        key={season.id}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSeason === (index++).toString()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {index}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
        <div className="grid gap-4 py-4">
          <MultipartDropzone />
        </div>
        <DialogFooter>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
