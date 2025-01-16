import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { COMMAND, EVENT } from '../constant';
import { delay, DragAndDropPayload } from '../helpers';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import {
  ALLOWED_IMAGE_EXT,
  ImageEventPayload,
  ImageStat,
  toImageStat,
  useCompressAppStore,
} from './store';
import { EmptyState } from './EmptyState';
import { Table } from './Table';
import { ToolbarAction } from './ToolbarAction';
import { SettingsPanel } from './SettingsPanel';

export function CompressAppContainer() {
  const [showSetting, setShowSetting] = useState<boolean>(false)

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

  const handleToggleSettingPanel = () => {
    setShowSetting(prev => !prev);
  }

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

  return (
    <div className="relative h-screen w-full">
      <div className="flex flex-col h-full py-4 px-2 justify-between">
        <ToolbarAction
          handleBack={handleBack}
          handleOpenImages={handleOpenImages}
          handleCompress={handleCompress}
          handleToggleSettingPanel={handleToggleSettingPanel}
          isProcessing={isProcessing}
          disabled={images.length === 0 || isProcessing}
        />

        <div className="flex gap-1">
          <div className="flex-grow flex flex-col flex-1 overflow-y-auto gap-4">
            {images && images.length > 0 ? (
              <Table images={images} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      <SettingsPanel show={showSetting} />
    </div>
  );
}
