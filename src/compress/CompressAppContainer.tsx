import { useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { COMMAND, EVENT } from '../constant';
import styles from './compress.module.css';
import {
  delay,
  formatNumber,
  getAssetFilename,
  getImageSize,
} from '../helpers';
import { listen } from '@tauri-apps/api/event';
import { ImageEventPayload, ImageStat, useCompressAppStore } from './store';
import { EmptyState } from './EmptyState';

async function toImageStat(src: string): Promise<ImageStat | null> {
  if (!src) {
    return null;
  }

  const pSrc = convertFileSrc(src);
  const fSize = await getImageSize(pSrc);

  return {
    src,
    public_src: pSrc,
    name: getAssetFilename(src),
    file_size: fSize,
    compressed_file_size: 0,
    saving: 0,
    progress: false,
  };
}

export function CompressAppContainer() {
  const { images, setImages, setProgress, stopProgress } =
    useCompressAppStore();

  const handleOpenImages = async () => {
    const files = await open({
      multiple: true,
      directory: false,
      defaultPath: await downloadDir(),
      filters: [
        {
          name: 'images',
          extensions: ['jpg', 'jpeg', 'png'],
        },
      ],
    });

    if (files) {
      let imgPromises = [];
      for (const file of files) {
        imgPromises.push(toImageStat(file));
      }
      const imgs = await Promise.all(imgPromises);
      setImages(imgs as ImageStat[]);
    } else {
      setImages([]);
    }
  };

  const handleBack = () => {
    setImages([]);
    invoke(COMMAND.RESET_APP);
  };

  const handleCompress = async () => {
    for await (const image of images) {
      setProgress(image);
      invoke(COMMAND.EXEC_COMPRESS, { image });
      await delay(500);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    listen<ImageEventPayload>(EVENT.ON_FINISH_COMPRESS_EVENT, (res) => {
      stopProgress(res.payload);
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);

  const renderSaving = ({
    progress,
    saving,
  }: {
    progress: boolean;
    saving: number;
  }) => {
    if (progress) {
      return (
        <div className="flex items-center gap-2">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <span>Compressing...</span>
        </div>
      );
    }

    if (!progress && saving === 0) {
      return <span>N/A</span>;
    }

    return <span>{formatNumber(saving)}%</span>;
  };

  return (
    <div className="relative h-screen w-full">
      <div className="flex flex-col h-full py-4 px-2 justify-between">
        <div className="flex flex-wrap gap-4 items-center justify-between p-2 pb-4 border-b">
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={handleBack} className={styles.btn_alt_xs}>
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
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Back
            </button>

            <button onClick={handleOpenImages} className={styles.btn_alt_xs}>
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
              Select images
            </button>
          </div>

          <button
            className={styles.btn_gradient_xs}
            disabled={images.length === 0}
            onClick={handleCompress}
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
            Compress
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto gap-4">
          {images && images.length > 0 ? (
            <div className="relative rounded-xl overflow-auto border">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>File name</th>
                    <th>Size (in bytes)</th>
                    <th>% Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img) => (
                    <tr key={img.public_src}>
                      <td>
                        <div className="flex gap-2 items-center">
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
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                          <span>{img.name}</span>
                        </div>
                      </td>
                      <td>{formatNumber(img.file_size)}</td>
                      <td>
                        {renderSaving({
                          progress: img.progress,
                          saving: img.saving,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
