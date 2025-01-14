import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { COMMAND } from '../constant';
import styles from './table.module.css';
import { getAssetFilename } from '../helpers';

export function CompressAppContainer() {
  const [images, setImages] = useState<string[]>([]);

  const handleOpenImages = async () => {
    const files = await open({
      multiple: true,
      directory: false,
      defaultPath: await downloadDir(),
      filters: [
        {
          name: 'images',
          extensions: ['jpg', 'jpeg', 'png', 'svg'],
        },
      ],
    });

    if (files) {
      setImages(files);
    }
  };

  const handleBack = () => {
    invoke(COMMAND.RESET_APP);
  };

  return (
    <div className="relative h-screen w-full">
      <div className="flex flex-col h-full py-4 px-2 justify-between">
        <div className="flex flex-wrap gap-4 items-center justify-between p-2">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleBack}
              className="btn flex gap-2 items-center justify-center !text-sm"
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
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Back
            </button>

            <button
              onClick={handleOpenImages}
              className="btn flex gap-2 items-center justify-center !text-sm"
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
              Open images
            </button>
          </div>

          <button
            className="btn gradient flex gap-2 items-center justify-center !text-sm"
            disabled={images.length === 0}
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
          {images && images.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Size</th>
                  <th>Savings</th>
                </tr>
              </thead>
              <tbody>
                {images.map((img) => (
                  <tr key={img}>
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
                        <span>{getAssetFilename(img)}</span>
                      </div>
                    </td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
