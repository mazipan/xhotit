import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

import './App.css';

import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { useEffect, useState } from 'react';
import {
  ClassMap,
  downloadImageFromDom,
  getAssetFilename,
} from '../helpers';
import { GradientSelect } from './GradientSelect';
import clsx from 'clsx';
import { convertFileSrc } from '@tauri-apps/api/core';
import { COMMAND, EVENT } from '../constant';
import { message } from '@tauri-apps/plugin-dialog';

export const MainAppContainer = () => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<
    string | undefined
  >();
  const [selectedGradient, setSelectedGradient] = useState<ClassMap | null>({
    id: 'hyper',
    class: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
    cssNative:
      'linear-gradient(to right, rgb(236, 72, 153), rgb(239, 68, 68), rgb(234, 179, 8))',
  });

  const handleDownloadImage = async () => {
    downloadImageFromDom('image-wrapper', 'image-el');
  };

  const handleNewCapture = async () => {
    invoke(COMMAND.OPEN_OVERLAY);
  }

  const [padding, setPadding] = useState<number>(24);
  const [bgRounded, setBgRounded] = useState<number>(48);
  const [imgRounded, setImgRounded] = useState<number>(48);

  useEffect(() => {
    let unsubscribe = () => {};

    listen(EVENT.ON_SCREENSHOT, (res) => {
      setSelectedScreenshot(res.payload as string);
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
    let unsubscribe = () => {};

    listen(EVENT.ON_GET_ACTIVE_WINDOW, async (res) => {
      if (res.payload === "error") {
        await message('Failed when trying to get active window position! Make sure you already give screen record permission', {
          title: 'Error Info',
          kind: 'error',
        });
      }
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="relative h-screen w-full">
      <Allotment vertical={false} separator={true}>

        <div id="preview" className="flex flex-col items-start gap-6 p-4">
          <h2 className="font-bold text-lg">
            Image Previewer{' '}
            {selectedScreenshot && (
              <small>({getAssetFilename(selectedScreenshot)})</small>
            )}

          </h2>
          <div className="relative overflow-auto">
            {selectedScreenshot ? (
              <div
                className={clsx(
                  'flex w-full flex-col justify-center items-center relative',
                  selectedGradient?.class
                )}
                style={{
                  padding: `${padding}px`,
                  borderRadius: `${bgRounded}px`,
                  height: 'auto',
                }}
              >
                <div className="flex flex-col">
                  <img
                    src={convertFileSrc(selectedScreenshot!)}
                    alt="Image Preview"
                    className="w-auto h-fit object-contain max-h-[500px]"
                    style={{
                      borderRadius: `${imgRounded - padding}px`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                <div
                  className="flex p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
                  role="alert"
                >
                  <svg
                    className="flex-shrink-0 inline w-4 h-4 me-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <span className="sr-only">Warning</span>
                  <div>
                    There is no image to shown in this panel. Let's capture new screenshot then the image will be previewed here.
                  </div>
                </div>

                <button
                  onClick={handleNewCapture}
                  className="gradient flex gap-2 items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  Capture New Image
                </button>
              </div>
            )}
          </div>
        </div>

        <Allotment.Pane minSize={200} maxSize={400} preferredSize={200}>
          <div id="setting" className="flex flex-col h-full py-4 px-2">
            <div className="flex flex-col flex-1 overflow-y-auto gap-4">
              <h2 className="font-bold text-lg">Backdrop</h2>
              <GradientSelect
                activeGradient={selectedGradient?.id || ''}
                onClick={(newGradient) => {
                  setSelectedGradient(newGradient);
                }}
              />

              <div className="w-full">
                <h2 className="font-bold">
                  Padding <small>({padding}px)</small>
                </h2>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={padding}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setPadding(parseInt(newVal));
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <h2 className="font-bold">
                  Bg Rounded <small>({bgRounded}px)</small>
                </h2>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={bgRounded}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setBgRounded(parseInt(newVal));
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <h2 className="font-bold">
                  Image Rounded <small>({imgRounded}px)</small>
                </h2>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={imgRounded}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setImgRounded(parseInt(newVal));
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={handleDownloadImage}
              className="gradient flex gap-2 items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Save Image
            </button>
          </div>
        </Allotment.Pane>
      </Allotment>
      <div className="absolute -top-[2000px] left-0 w-full">
        <div
          id="image-wrapper"
          className={clsx(
            'flex w-full flex-col justify-center items-center relative',
            selectedGradient?.class
          )}
          style={{
            padding: `${padding}px`,
            borderRadius: `${bgRounded}px`,
          }}
        >
          <div className="flex flex-col">
            {selectedScreenshot && (
              <img
                id="image-el"
                src={convertFileSrc(selectedScreenshot)}
                alt="Image Preview"
                className="w-full h-auto"
                style={{
                  borderRadius: `${imgRounded - padding}px`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
