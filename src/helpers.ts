import { writeFile } from '@tauri-apps/plugin-fs';
import { save, message } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';

import { domToPng } from 'modern-screenshot';
import { customAlphabet } from 'nanoid';
import { APP_DOWNLOAD_DIR } from './constant';

export function getRandomId(size = 5) {
  const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    size
  );

  return nanoid(size);
}

export type ScreenshotItem = {
  filePath: string;
  assetPath: string;
};

export function getAssetFilename(str?: string) {
  if (!str) {
    return '';
  }

  const parts = str?.split('/');
  return parts[parts.length - 1];
}

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
            console.error('Failed when try to save file!', error);
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
