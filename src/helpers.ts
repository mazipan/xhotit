import { writeFile } from '@tauri-apps/plugin-fs';
import { save, message } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';

import { domToPng } from 'modern-screenshot';
import { customAlphabet } from 'nanoid';

export function getRandomId(size = 5) {
  const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    size
  );

  return nanoid(size);
}

export const APP_DOWNLOAD_DIR = 'xhotit-screenshots';

export type ScreenshotItem = {
  filePath: string;
  assetPath: string;
};

export function getAssetFilename(str?: ScreenshotItem) {
  if (!str) {
    return '';
  }
  const parts = str?.assetPath.split('%2F');
  return parts[parts.length - 1];
}

export type ClassMap = {
  id: string;
  class: string;
  cssNative?: string;
};

// Pick from https://hypercolor.dev/
export const GRADIENTS: ClassMap[] = [
  {
    id: 'hyper',
    class: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
    cssNative:
      'linear-gradient(to right, rgb(236, 72, 153), rgb(239, 68, 68), rgb(234, 179, 8))',
  },
  {
    id: 'pinkneon',
    class: 'bg-gradient-to-r from-fuchsia-600 to-pink-600',
    cssNative:
      'linear-gradient(to right, rgb(192, 38, 211), rgb(219, 39, 119))',
  },
  {
    id: 'oceanic',
    class: 'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600',
    cssNative:
      'linear-gradient(to right, rgb(134, 239, 172), rgb(59, 130, 246), rgb(147, 51, 234))',
  },
  {
    id: 'pumkin',
    class: 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700',
    cssNative:
      'linear-gradient(to right, rgb(254, 240, 138), rgb(250, 204, 21), rgb(161, 98, 7))',
  },
  {
    id: 'rasta',
    class: 'bg-gradient-to-r from-lime-600 via-yellow-300 to-red-600',
    cssNative:
      'linear-gradient(to right, rgb(101, 163, 13), rgb(253, 224, 71), rgb(220, 38, 38))',
  },
  {
    id: 'sublime',
    class: 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500',
    cssNative:
      'linear-gradient(to right, rgb(251, 113, 133), rgb(217, 70, 239), rgb(99, 102, 241))',
  },
  {
    id: 'owahu',
    class: 'bg-gradient-to-t from-orange-400 to-sky-400',
    cssNative: 'linear-gradient(to top, rgb(251, 146, 60), rgb(56, 189, 248))',
  },
  {
    id: 'morning',
    class: 'bg-gradient-to-r from-rose-400 to-orange-300',
    cssNative:
      'linear-gradient(to right, rgb(251, 113, 133), rgb(253, 186, 116))',
  },
  {
    id: 'messenger',
    class: 'bg-gradient-to-r from-sky-400 to-blue-500',
    cssNative:
      'linear-gradient(to right, rgb(56, 189, 248), rgb(59, 130, 246))',
  },
  {
    id: 'seafoam',
    class: 'bg-gradient-to-r from-green-200 via-green-300 to-blue-500',
    cssNative:
      'linear-gradient(to right, rgb(187, 247, 208), rgb(134, 239, 172), rgb(59, 130, 246))',
  },
  {
    id: 'emerald',
    class: 'bg-gradient-to-r from-emerald-500 to-lime-600',
    cssNative:
      'linear-gradient(to right, rgb(16, 185, 129), rgb(101, 163, 13))',
  },
  {
    id: 'candy',
    class: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400',
    cssNative:
      'linear-gradient(to right, rgb(249, 168, 212), rgb(216, 180, 254), rgb(129, 140, 248))',
  },
  {
    id: 'bigsur',
    class: 'bg-gradient-to-r from-violet-500 to-orange-300',
    cssNative:
      'linear-gradient(to right, rgb(139, 92, 246), rgb(253, 186, 116))',
  },
  {
    id: 'flower',
    class: 'bg-gradient-to-r from-violet-300 to-violet-400',
    cssNative:
      'linear-gradient(to right, rgb(196, 181, 253), rgb(167, 139, 250))',
  },
  {
    id: 'ice',
    class: 'bg-gradient-to-r from-rose-100 to-teal-100',
    cssNative:
      'linear-gradient(to right, rgb(255, 228, 230), rgb(204, 251, 241))',
  },
];

export async function downloadImageFromDom(
  elementWrapperId: string,
  elementImageId: string
) {
  const domWrapper = document.querySelector(`#${elementWrapperId}`);
  const domImage = document.querySelector(`#${elementImageId}`);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `img-${timestamp}-${getRandomId(5)}.png`;
  const defaultPath = await downloadDir();

  const selectedPath = await save({
    defaultPath: `${defaultPath}/${APP_DOWNLOAD_DIR}/${filename}`,
    filters: [
      {
        name: filename,
        extensions: ['png'],
      },
    ],
  });

  if (selectedPath && domWrapper) {
    if (domImage) {
      // @ts-ignore
      // domImage.style.width = '1200px';
      // @ts-ignore
      // domImage.style.height = '1200px';
    }

    domToPng(domWrapper)
      .then((dataUrl: string) => {
        fetch(dataUrl, {
          headers: new Headers({
            Origin: location.origin,
          }),
          mode: 'cors',
        })
          .then((response) => response.blob())
          .then(async (blob) => {
            const contents = new Uint8Array(await blob.arrayBuffer());

            await writeFile(`${selectedPath}`, contents, {
              // baseDir: BaseDirectory.Download,
            });

            await message(`Image has been saved in ${selectedPath}`, {
              title: 'Success Info',
              kind: 'info',
            });

            if (domImage) {
              // @ts-ignore
              // domImage.style.removeProperty('width');
              // @ts-ignore
              // domImage.style.removeProperty('height');
            }
          })
          .catch(async (error) => {
            console.error(error);
            await message('Failed when try to save file!', {
              title: 'Error Info',
              kind: 'error',
            });
          });
      })
      .catch(async (error: Error) => {
        console.error('Opps, something went wrong!', error);
        await message('Something went wrong when trying to convert to image!', {
          title: 'Error Info',
          kind: 'error',
        });
      });
  }
}
