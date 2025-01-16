
import { XMarkIcon, ArrowDownTrayIcon  } from '@heroicons/react/24/outline';

import { ClassMap } from '../gradients';
import { downloadImageFromDom } from '../helpers';
import { GradientSelect } from './GradientSelect';

export function SettingPanel({
  gradient,
  onClickNewGradient,
  padding,
  onChangePadding,
  bgRounded,
  onChangeBgRounded,
  imgRounded,
  onChangeImgRounded,
  onReset,
}: {
  gradient: ClassMap | null;
  onClickNewGradient: (newGradient: ClassMap) => void;
  padding: number;
  onChangePadding: (e: React.ChangeEvent<HTMLInputElement>) => void;
  bgRounded: number;
  onChangeBgRounded: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imgRounded: number;
  onChangeImgRounded: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void
}) {
  const handleDownloadImage = async () => {
    downloadImageFromDom('image-wrapper', 'image-el');
  };

  return (
    <div id="setting" className="flex flex-col h-full py-4 px-2">
      <div className="flex flex-col flex-1 overflow-y-auto gap-4">
        <h2 className="font-bold text-lg">
          Backdrop{' '}
          <small className="text-xs text-gray-400">({gradient?.id})</small>
        </h2>
        <GradientSelect
          activeGradient={gradient?.id || ''}
          onClick={onClickNewGradient}
        />

        <div className="w-full">
          <h2 className="font-bold">
            Padding{' '}
            <small className="text-xs text-gray-400">({padding}px)</small>
          </h2>
          <input
            type="range"
            min="0"
            max="100"
            value={padding}
            onChange={onChangePadding}
            className="w-full"
          />
        </div>

        <div className="w-full">
          <h2 className="font-bold">
            Bg Rounded{' '}
            <small className="text-xs text-gray-400">({bgRounded}px)</small>
          </h2>
          <input
            type="range"
            min="0"
            max="100"
            value={bgRounded}
            onChange={onChangeBgRounded}
            className="w-full"
          />
        </div>

        <div className="w-full">
          <h2 className="font-bold">
            Image Rounded{' '}
            <small className="text-xs text-gray-400">({imgRounded}px)</small>
          </h2>
          <input
            type="range"
            min="0"
            max="100"
            value={imgRounded}
            onChange={onChangeImgRounded}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2 items-center w-full">
        <button
          onClick={onReset}
          className="btn gradient flex gap-2 items-center justify-center !px-2"
        >
          <XMarkIcon className="size-6" />
        </button>
        <button
          onClick={handleDownloadImage}
          className="btn gradient flex gap-2 items-center justify-center flex-grow"
        >
          <ArrowDownTrayIcon className="size-6" />
          Save image
        </button>
      </div>
    </div>
  );
}
