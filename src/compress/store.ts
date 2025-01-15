import { convertFileSrc } from '@tauri-apps/api/core';
import { create } from 'zustand';
import { getImageSize } from '../helpers';

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

export interface CompressAppState {
  images: ImageStat[];
  setImages: (payload: ImageStat[]) => void;
  setProgress: (payload: ImageStat) => void;
  stopProgress: (payload: ImageEventPayload) => void;
}

export const useCompressAppStore = create<CompressAppState>((set, get) => ({
  images: [],
  setImages: (payload) =>
    set(() => ({
      images: payload,
    })),
  setProgress: (payload) =>
    set((state) => ({
      images: state.images.map((i) => {
        if (i.src === payload.src) {
          i.progress = true;
        }
        return i;
      }),
    })),
  stopProgress: async (payload) => {
    const images = get().images;
    const matchImage = images.find((img) => img.src === payload.origin);
    if (!matchImage) {
      return;
    }

    const pSrc = convertFileSrc(payload.compressed);
    const newSize = await getImageSize(pSrc);
    const saving = newSize / matchImage.file_size * 100

    set((state) => ({
      images: state.images.map((i) => {
        if (i.src === payload.origin) {
          i.progress = false;
          i.saving = saving;
        }
        return i;
      }),
    }));
  },
}));
