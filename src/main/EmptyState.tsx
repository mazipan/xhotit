import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import {
  ViewfinderCircleIcon,
  FolderOpenIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

import { COMMAND } from '../constant';

export function EmptyState({
  onPickNewImage,
}: {
  onPickNewImage: (newImage: string) => void;
}) {
  const handleNewCapture = async () => {
    invoke(COMMAND.OPEN_OVERLAY);
  };

  const handleOpenImage = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      defaultPath: await downloadDir(),
    });

    if (file) {
      onPickNewImage?.(file);
    }
  };

  const handleOpenCompress = async () => {
    invoke(COMMAND.OPEN_COMPRESS);
  };

  return (
    <div className="relative h-screen w-full max-w-lg flex flex-col justify-center items-center gap-4 p-4 py-6 mx-auto">
      <div className="w-full relative mb-8 flex flex-col gap-2 items-center">
        <div className="absolute top-0 -left-4 w-48 h-48 bg-purple-300 rounded-full opacity-70 mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 bg-yellow-300 rounded-full opacity-70 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-44 w-40 h-40 bg-pink-300 rounded-full opacity-70 mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

        <h1 className="z-10 text-5xl font-semibold">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 inline-block text-transparent bg-clip-text">
            Xhot It
          </span>
        </h1>

        <p className="z-10 font-medium text-xl">
          Just another screen capture app
        </p>

        <div className="bg-black rounded-full p-4 border-yellow-300 border-4 transition-transform transform duration-500 hover:rotate-180 z-10 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="350"
            height="387"
            fill="none"
            viewBox="0 0 350 387"
            className="size-10"
          >
            <path
              stroke="#FACC15"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="10"
              d="m172.332 99.399-5.082 17.789-5.082-17.79a28.13 28.13 0 0 0-19.317-19.315L125.062 75l17.789-5.082A28.13 28.13 0 0 0 162.168 50.6l5.082-17.788 5.082 17.788a28.13 28.13 0 0 0 19.317 19.317L209.438 75l-17.789 5.082A28.13 28.13 0 0 0 172.332 99.4M225.118 54.466l-1.618 6.471-1.618-6.471a21.09 21.09 0 0 0-15.348-15.348l-6.472-1.618 6.472-1.618a21.09 21.09 0 0 0 15.348-15.348l1.618-6.471 1.618 6.471a21.09 21.09 0 0 0 15.348 15.348l6.472 1.618-6.472 1.618a21.09 21.09 0 0 0-15.348 15.348M216.589 128.545l-2.464 7.393-2.464-7.393a14.06 14.06 0 0 0-8.894-8.893l-7.392-2.464 7.392-2.465a14.06 14.06 0 0 0 8.894-8.893l2.464-7.392 2.464 7.392a14.06 14.06 0 0 0 8.894 8.893l7.392 2.465-7.392 2.464a14.06 14.06 0 0 0-8.894 8.893"
            ></path>
            <path
              stroke="#FACC15"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="30"
              d="M109.375 91.688H87.5c-18.122 0-32.812 14.69-32.812 32.812v21.875m185.937-54.687H262.5c18.122 0 32.812 14.69 32.812 32.812v21.875m0 131.25V299.5c0 18.122-14.69 32.812-32.812 32.812h-21.875m-131.25 0H87.5c-18.122 0-32.812-14.69-32.812-32.812v-21.875M218.75 212c0 24.162-19.588 43.75-43.75 43.75s-43.75-19.588-43.75-43.75 19.588-43.75 43.75-43.75 43.75 19.588 43.75 43.75"
            ></path>
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={handleNewCapture}
          className="btn gradient flex gap-2 items-center justify-center !text-sm"
        >
          <ViewfinderCircleIcon className="size-4" />
          Capture area
        </button>

        <button
          onClick={handleOpenImage}
          className="btn gradient flex gap-2 items-center justify-center !text-sm"
        >
          <FolderOpenIcon className="size-4" />
          Open image
        </button>

        <button
          onClick={handleOpenCompress}
          className="btn gradient flex gap-2 items-center justify-center !text-sm"
        >
          <BoltIcon className="size-4" />
          Compress image
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Version:{' '}
        <span id="current-version">{'1.1.0'}</span>
      </p>
    </div>
  );
}
