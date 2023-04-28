import { Loader2Icon } from "lucide-react";
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
import { api } from "~/utils/api";

export function AddShowDialog() {
  const [title, setTitle] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");

  const addTvShow = api.shows.addTVShow.useMutation();

  const handleSubmit = () => {
    addTvShow.mutate(
      {
        title,
        imageUrl: coverPhoto,
      },
      {
        onSuccess: () => {
          setTitle("");
          setCoverPhoto("");
        },
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add TV Show</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add TV Show</DialogTitle>
          <DialogDescription>Adds a new TV Show to listing.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverPhoto" className="text-right">
              Cover Photo
            </Label>
            <Input
              id="coverPhoto"
              value={coverPhoto}
              type="url"
              onChange={(e) => setCoverPhoto(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            {addTvShow.isLoading ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Add Show"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
