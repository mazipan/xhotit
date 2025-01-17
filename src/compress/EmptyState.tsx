import { InboxArrowDownIcon } from "@heroicons/react/24/outline";

export function EmptyState() {
  return (
    <div className="relative h-screen w-full max-w-lg flex flex-col justify-center items-center gap-4 p-4 mx-auto" id="drop-area">
      <div className="w-full relative flex flex-col gap-2 items-center justify-center border-4 border-dashed rounded-lg p-8 min-h-[150px] text-center">
        <InboxArrowDownIcon className="size-14 text-gray-400" />
        <p className="font-medium text-xl">No image selected!</p>
        <p className="">Compress your image to save more storage.</p>
      </div>
    </div>
  );
}
