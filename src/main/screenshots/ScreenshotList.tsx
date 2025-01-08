import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useScreenshotList } from './useScreenshotList';
import { getAssetFilename, ScreenshotItem } from '../../helpers';

type Props = {
  onSelectedChange: (imageSrc: ScreenshotItem | undefined) => void;
};

export const ScreenshotList = ({ onSelectedChange }: Props) => {
  const [selected, setSelected] = useState<number>(0);
  const onFirstLoad = useRef(false);

  const { screenshots, getScreenshotsData } = useScreenshotList();

  useEffect(() => {
    let unlisten = () => {};
    getCurrentWindow()
      .onFocusChanged(({ payload: focused }) => {
        if (focused) {
          getScreenshotsData();
        }
      })
      .then((fn) => (unlisten = fn));

    getScreenshotsData();

    return () => {
      unlisten();
    };
  }, []);

  useEffect(() => {
    let unsibscribe = () => {};
    listen('on_screenshot', () => {
      getScreenshotsData().then(() => {
        setSelected(0);
        onSelectedChange(screenshots[0]);
      });
      onFirstLoad.current = false;
    }).then((fn) => (unsibscribe = fn));

    return () => {
      unsibscribe();
    };
  }, []);

  useEffect(() => {
    if (screenshots.length) {
      if (!onFirstLoad.current) {
        setSelected(0);
        onSelectedChange(screenshots[0]);
        onFirstLoad.current = true;
      }
    }
  }, [screenshots]);

  return (
    <div className="flex flex-col gap-4">
      {screenshots.map((screenshot, index) => (
        <div
          onClick={() => {
            setSelected(index);
            onSelectedChange(screenshot);
          }}
          key={index}
          className={clsx(
            'rounded-lg relative min-h-[80px]',
            selected === index ? 'border-blue-700 border-2' : ''
          )}
        >
          <img
            src={screenshot.assetPath}
            alt="Screenshot"
            width={200}
            loading="lazy"
            className="rounded-lg"
          />
          <div className="rounded-lg p-2 absolute bottom-0 left-0 w-full max-w-[200px]">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-1 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {getAssetFilename(screenshot)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
