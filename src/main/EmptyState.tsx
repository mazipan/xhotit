import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';

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
        <h1 className="text-5xl font-semibold">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 inline-block text-transparent bg-clip-text">
            Xhot It
          </span>
        </h1>

        <p className="font-medium text-xl">Just another screen capture app</p>

        <div className="bg-black rounded-full p-4 border-yellow-300 border-4">
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

        <div className="absolute top-0 -left-4 w-48 h-48 bg-purple-300 rounded-full opacity-70 mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 bg-yellow-300 rounded-full opacity-70 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-44 w-40 h-40 bg-pink-300 rounded-full opacity-70 mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={handleNewCapture}
          className="btn gradient flex gap-2 items-center justify-center !text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          Capture area
        </button>

        <button
          onClick={handleOpenImage}
          className="btn gradient flex gap-2 items-center justify-center !text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
            />
          </svg>
          Open image
        </button>

        <button
          onClick={handleOpenCompress}
          className="btn gradient flex gap-2 items-center justify-center !text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
            />
          </svg>
          Compress image
        </button>
      </div>
    </div>
  );
}
