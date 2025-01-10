import { convertFileSrc } from '@tauri-apps/api/core';
import clsx from 'clsx';
import { ClassMap } from '../gradients';

export function GhostPanel({
  image,
  gradient,
  padding,
  bgRounded,
  imgRounded,
}: {
  image?: string;
  gradient: ClassMap | null;
  padding: number;
  bgRounded: number;
  imgRounded: number;
}) {
  return (
    <div className="absolute -top-[2000px] left-0 w-full">
      <div
        id="image-wrapper"
        className={clsx(
          'flex w-full flex-col justify-center items-center relative',
          gradient?.class
        )}
        style={{
          padding: `${padding}px`,
          borderRadius: `${bgRounded}px`,
        }}
      >
        <div className="flex flex-col">
          {image && (
            <img
              id="image-el"
              src={convertFileSrc(image)}
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
  );
}