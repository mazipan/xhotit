import { convertFileSrc } from '@tauri-apps/api/core';
import clsx from 'clsx';
import { ClassMap } from '../gradients';
import { getAssetFilename } from '../helpers';

export function PreviewPanel({
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
    <div id="preview" className="flex flex-col items-start gap-6 p-4">
      <h2 className="font-bold text-lg">
        Image Previewer {image && <small>({getAssetFilename(image)})</small>}
      </h2>

      <div className="relative overflow-auto">
        <div
          className={clsx(
            'flex w-full flex-col justify-center items-center relative',
            gradient?.class
          )}
          style={{
            padding: `${padding}px`,
            borderRadius: `${bgRounded}px`,
            height: 'auto',
          }}
        >
          <div className="flex flex-col">
            <img
              src={convertFileSrc(image!)}
              alt="Image Preview"
              className="w-auto h-fit object-contain max-h-[500px]"
              style={{
                borderRadius: `${imgRounded - padding}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
