import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
// @ts-ignore
import domtoimage from 'dom-to-image-more';

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

/**
 * @see https://dev.to/nombrekeff/download-file-from-blob-21ho
 * @param blob <Blob>
 * @param filename <string>
 */
export function downloadFromHref(href: string, filename: string) {
  fetch(href, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: 'cors',
  })
    .then((response) => response.blob())
    .then((blob) => {
      let blobUrl = window.URL.createObjectURL(blob);
      let link = document.createElement('a');
      link.setAttribute('download', filename);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch((error) => {
      console.error(error);
    });

  // // Create a link element
  // const link = document.createElement('a')

  // link.href = href
  // link.download = filename
  // link.setAttribute('data-filename', filename)
  // link.style.display = 'none'

  // // Append link to the body
  // document.body.appendChild(link)

  // // Dispatch click event on the link
  // // This is necessary as link.click() does not work on the latest firefox
  // link.dispatchEvent(
  //   new MouseEvent('click', {
  //     bubbles: true,
  //     cancelable: true,
  //     view: window,
  //   }),
  // )

  // // Remove link from body
  // document.body.removeChild(link)
}

export function downloadImageFromDom(elementWrapperId: string, elementImageId: string) {
  const domWrapper = document.querySelector(`#${elementWrapperId}`);
  const domImage = document.querySelector(`#${elementImageId}`);

  if (domImage) {
    // @ts-ignore
    domImage.style.width = "1200px";
  }

  if (domWrapper) {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/, '-')
      .replace('T', '_')
      .replace('Z', '')
      .trim();

    // eslint-disable-next-line
    // @ts-ignore
    domtoimage
      .toPng(domWrapper)
      .then((dataUrl: string) => {
        const filename = `xhot-editted-${timestamp}.png`;

        fetch(dataUrl, {
          headers: new Headers({
            Origin: location.origin,
          }),
          mode: 'cors',
        })
          .then((response) => response.arrayBuffer())
          .then(async (buffer) => {
            console.log("Byte length", buffer.byteLength)
            const contents = [...new Uint8Array(buffer, 0, buffer.byteLength)];

            await writeFile(`${filename}`, contents, {
              baseDir: BaseDirectory.Download,
            });

            if (domImage) {
              // @ts-ignore
              // domImage.style.removeProperty('width');
            }
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error: Error) => {
        console.error('Opps, something went wrong!', error);
      });
  }
}
