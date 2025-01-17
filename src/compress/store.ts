import { convertFileSrc } from '@tauri-apps/api/core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAssetFilename, getImageSize } from '../helpers';

export type ImageStat = {
  src: string;
  public_src: string;
  name: string;
  file_size: number;
  compressed_file_size: number;
  saving: number;
  progress: boolean;
};

export type ImageEventPayload = {
  origin: string;
  compressed: string;
};

export type PngFilter = 'MINSUM' | 'ENTROPY' | 'BRUTE_FORCE'

export const PngFilterEnum = {
  MINSUM: 'MINSUM',
  ENTROPY: 'ENTROPY',
  BRUTE_FORCE: 'BRUTE_FORCE'
} as const

export type Settings = {
  quality: number;
  overwrite: boolean;
  filter: PngFilter
};

export interface CompressAppState {
  images: ImageStat[];
  compressed: ImageEventPayload[];
  isProcessing: boolean;
  settings: Settings;

  setSettingQuality: (payload: number) => void
  toggleSettingOverwrite: () => void
  setSettingFilter: (payload: PngFilter) => void

  addImage: (payload: string) => void;
  setImages: (payload: ImageStat[]) => void;
  setProgress: (payload: ImageStat) => void;
  stopProgress: (payload: ImageEventPayload) => void;
}

export const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png'];

export async function toImageStat(src: string): Promise<ImageStat | null> {
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

export const useCompressAppStore = create<CompressAppState>()(
  persist(
    (set, get) => ({
      images: [],
      compressed: [],
      isProcessing: false,

      settings: {
        overwrite: false,
        quality: 70,
        filter: 'MINSUM'
      },

      setSettingQuality: (payload) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quality: payload
          }
        }))
      },


      toggleSettingOverwrite: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            overwrite: !state.settings.overwrite
          }
        }))
      },

      setSettingFilter: (payload) => {
        set((state) => ({
          settings: {
            ...state.settings,
            filter: payload
          }
        }))
      },

      addImage: async (payload) => {
        if (!payload) {
          return;
        }

        let isAllowedExt = false;
        for (let index = 0; index < ALLOWED_IMAGE_EXT.length; index++) {
          const ext = ALLOWED_IMAGE_EXT[index];
          if (payload.endsWith(ext)) {
            isAllowedExt = true;
            break;
          }
        }

        if (isAllowedExt) {
          const images = get().images;
          const isExist = images.find((i) => i.src === payload);

          if (!isExist) {
            const newImageStat = await toImageStat(payload);

            if (newImageStat) {
              set(() => ({
                images: [...images, newImageStat],
              }));
            }
          }
        }
      },

      setImages: (payload) =>
        set(() => ({
          images: payload,
          compressed: [],
        })),

      setProgress: (payload) =>
        set((state) => ({
          images: state.images.map((i) => {
            if (i.src === payload.src) {
              i.progress = true;
            }
            return i;
          }),
          isProcessing: true,
        })),

      stopProgress: async (payload) => {
        const images = get().images;

        const matchImage = images.find((img) => img.src === payload.origin);
        if (!matchImage) {
          return;
        }

        const pSrc = convertFileSrc(payload.compressed);
        const newSize = await getImageSize(pSrc);
        let saving = 0;

        if (newSize === matchImage.file_size) {
          // Do nothing
        } else if (newSize < matchImage.file_size) {
          saving = (newSize / matchImage.file_size) * 100;
        } else {
          saving = -((newSize / matchImage.file_size) * 100);
        }

        set((state) => ({
          images: state.images.map((i) => {
            if (i.src === payload.origin) {
              i.progress = false;
              i.saving = saving;
              i.compressed_file_size = newSize;
            }
            return i;
          }),
          compressed: [...state.compressed, payload],
          isProcessing: state.compressed.length === images.length - 1,
        }));
      },
    }),
    {
      name: 'compress-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
