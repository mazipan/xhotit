import { invoke } from '@tauri-apps/api/core';
import { download } from '@tauri-apps/plugin-upload';
import { open, BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
import './App.css';

import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { ScreenshotList } from './screenshots/ScreenshotList';
import { useState } from 'react';
import {
  APP_DOWNLOAD_DIR,
  ClassMap,
  downloadImageFromDom,
  getAssetFilename,
  ScreenshotItem,
} from '../helpers';
import { GradientSelect } from './screenshots/GradientSelect';
import clsx from 'clsx';

const handleOpenAppDirectory = () => {
  invoke('open_app_directory', { subdirectory: APP_DOWNLOAD_DIR }).catch(
    (err) => console.error('Error opening downloads directory:', err)
  );
};

export const MainAppContainer = () => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<
    ScreenshotItem | undefined
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

  const [padding, setPadding] = useState<number>(24);
  const [bgRounded, setBgRounded] = useState<number>(48);
  const [imgRounded, setImgRounded] = useState<number>(48);

  return (
    <div className="h-screen w-full">
      <Allotment vertical={false} separator={true}>
        <Allotment.Pane maxSize={200}>
          <div
            id="directory"
            className="flex flex-col max-w-[200px] border-r border-r-gray-500/30 h-full py-4 px-2"
          >
            <h2 className="font-bold text-lg">Screenshot Directory</h2>
            <div className="flex flex-col flex-1 overflow-y-auto">
              <ScreenshotList
                onSelectedChange={(screenshot: ScreenshotItem | undefined) => {
                  setSelectedScreenshot(screenshot);
                }}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleOpenAppDirectory}
                className="flex gap-2 items-center flex-grow"
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
                    d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                  />
                </svg>
                Open Folder
              </button>
            </div>
          </div>
        </Allotment.Pane>

        <div id="preview" className="flex flex-col items-start gap-6 p-4">
          <h2 className="font-bold text-lg">
            Image Previewer{' '}
            <small>({getAssetFilename(selectedScreenshot)})</small>
          </h2>
          <div className="relative overflow-auto">
            {selectedScreenshot ? (
              <div
                id="image-wrapper"
                className={clsx(
                  'flex flex-col justify-center items-center relative',
                  selectedGradient?.class
                )}
                style={{
                  padding: `${padding}px`,
                  borderRadius: `${bgRounded}px`,
                  width: '1200px',
                  height: 'auto',
                }}
              >
                <div className="flex flex-row">
                  <img
                    id="image-el"
                    src={selectedScreenshot?.assetPath}
                    alt="Screenshot"
                    className="w-full h-auto object-contain shadow-xl"
                    style={{
                      borderRadius: `${imgRounded - padding}px`,
                    }}
                  />
                </div>
              </div>
            ) : (
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
                  <span className="font-medium">No Image Selected!</span> Select
                  any image from left pane to preview and modify the background.
                </div>
              </div>
            )}
          </div>
        </div>

        <Allotment.Pane minSize={200} maxSize={230} preferredSize={200}>
          <div id="setting" className="flex flex-col h-full py-4 px-2">
            <div className="flex flex-col flex-1 overflow-y-auto">
              <h2 className="font-bold text-lg">Background</h2>
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
                  className="slider"
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
                  className="slider"
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
                  className="slider"
                />
              </div>
            </div>

            <button
              onClick={handleDownloadImage}
              className="flex gap-2 items-center"
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
    </div>
  );
};
