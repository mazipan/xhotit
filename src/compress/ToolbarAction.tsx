import {
  ArrowLeftIcon,
  FolderOpenIcon,
  BoltIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import styles from './compress.module.css';
import { SpinnerIcon } from '../icons/Spinner';

export function ToolbarAction({
  handleBack,
  handleCompress,
  handleOpenImages,
  handleToggleSettingPanel,
  isProcessing,
  disabled,
}: {
  handleBack: () => void;
  handleCompress: () => void;
  handleOpenImages: () => void;
  handleToggleSettingPanel: () => void;
  isProcessing: boolean;
  disabled: boolean;
}) {
  return (
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

      <div className="flex flex-wrap gap-2 items-center">
        <button
          className={styles.btn_gradient_xs}
          disabled={disabled}
          onClick={handleCompress}
        >
          {isProcessing ? <SpinnerIcon /> : <BoltIcon className="size-4" />}
          Compress
        </button>
        <button
          className={styles.btn_alt_xs}
          onClick={handleToggleSettingPanel}
        >
          <Cog6ToothIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
