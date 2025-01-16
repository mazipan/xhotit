import { useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import byteSize from 'byte-size'
import {
  ArrowLeftIcon,
  FolderOpenIcon,
  BoltIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { COMMAND, EVENT } from '../constant';
import styles from './compress.module.css';
import { delay, DragAndDropPayload, formatNumber } from '../helpers';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import {
  ALLOWED_IMAGE_EXT,
  ImageEventPayload,
  ImageStat,
  toImageStat,
  useCompressAppStore,
} from './store';
import { EmptyState } from './EmptyState';
import { SpinnerIcon } from '../icons/Spinner';

export function CompressAppContainer() {
  const {
    images,
    isProcessing,
    addImage,
    setImages,
    setProgress,
    stopProgress,
  } = useCompressAppStore();

  const handleOpenImages = async () => {
    const files = await open({
      multiple: true,
      directory: false,
      defaultPath: await downloadDir(),
      filters: [
        {
          name: 'images',
          extensions: ALLOWED_IMAGE_EXT,
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
    if (!isProcessing) {
      for await (const image of images) {
        // Do not re-invoke for image that is in the progress
        if (image.saving === 0 && !image.progress) {
          setProgress(image);
          invoke(COMMAND.EXEC_COMPRESS, { image });
        }
      }
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

  useEffect(() => {
    let unsubscribe = () => {};

    listen<DragAndDropPayload>(TauriEvent.DRAG_DROP, (res) => {
      if (!res || res.payload.paths.length === 0) {
        return;
      }

      let paths = res.payload.paths;
      for (const p of paths) {
        addImage(p);
        delay(300);
      }
    }).then((fn) => (unsubscribe = fn));

    return () => {
      unsubscribe();
    };
  }, []);

  const renderSaving = ({
    progress,
    saving,
    compressed,
  }: {
    progress: boolean;
    saving: number;
    compressed: boolean;
  }) => {
    if (progress) {
      return (
        <div className="flex items-center gap-2">
          <SpinnerIcon />
          <span>Compressing...</span>
        </div>
      );
    }

    if (!progress && !compressed && saving === 0) {
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
              <ArrowLeftIcon className="size-4" />
              Back
            </button>

            <button onClick={handleOpenImages} className={styles.btn_alt_xs}>
              <FolderOpenIcon className="size-4" />
              Select images
            </button>
          </div>

          <button
            className={styles.btn_gradient_xs}
            disabled={images.length === 0 || isProcessing}
            onClick={handleCompress}
          >
            {isProcessing ? <SpinnerIcon /> : <BoltIcon className="size-4" />}
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
                    <th>Original Size</th>
                    <th>Compressed Size</th>
                    <th>% Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img) => (
                    <tr key={img.public_src}>
                      <td>
                        <div className="flex gap-2 items-center">
                          <PhotoIcon className="size-4" />
                          <span>{img.name}</span>
                        </div>
                      </td>
                      <td>{formatNumber(img.file_size)} ({byteSize(img.file_size).toString()})</td>
                      <td>
                        {img.compressed_file_size
                          ? `${formatNumber(img.compressed_file_size)} (${byteSize(img.compressed_file_size).toString()})`
                          : 'N/A'}
                      </td>
                      <td>
                        {renderSaving({
                          progress: img.progress,
                          saving: img.saving,
                          compressed: img.compressed_file_size !== 0
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
