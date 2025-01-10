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
}: {
  gradient: ClassMap | null;
  onClickNewGradient: (newGradient: ClassMap) => void
  padding: number;
  onChangePadding: (e: React.ChangeEvent<HTMLInputElement>) => void
  bgRounded: number;
  onChangeBgRounded: (e: React.ChangeEvent<HTMLInputElement>) => void
  imgRounded: number;
  onChangeImgRounded: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const handleDownloadImage = async () => {
    downloadImageFromDom('image-wrapper', 'image-el');
  };

  return (
    <div id="setting" className="flex flex-col h-full py-4 px-2">
      <div className="flex flex-col flex-1 overflow-y-auto gap-4">
        <h2 className="font-bold text-lg">Backdrop</h2>
        <GradientSelect
          activeGradient={gradient?.id || ''}
          onClick={onClickNewGradient}
        />

        <div className="w-full">
          <h2 className="font-bold">
            Padding <small>({padding}px)</small>
          </h2>
          <input
            type="range"
            min="1"
            max="100"
            value={padding}
            onChange={onChangePadding}
            className="w-full"
          />
        </div>

        <div className="w-full">
          <h2 className="font-bold">
            Bg Rounded <small>({bgRounded}px)</small>
          </h2>
          <input
            type="range"
            min="1"
            max="100"
            value={bgRounded}
            onChange={onChangeBgRounded}
            className="w-full"
          />
        </div>

        <div className="w-full">
          <h2 className="font-bold">
            Image Rounded <small>({imgRounded}px)</small>
          </h2>
          <input
            type="range"
            min="1"
            max="100"
            value={imgRounded}
            onChange={onChangeImgRounded}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={handleDownloadImage}
        className="btn gradient flex gap-2 items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Save image
      </button>
    </div>
  );
}
