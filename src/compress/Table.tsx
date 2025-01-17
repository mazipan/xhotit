import byteSize from 'byte-size'
import {
  PhotoIcon,
} from '@heroicons/react/24/outline';
import styles from './compress.module.css';
import { formatNumber } from '../helpers';
import {
  ImageStat,
} from './store';
import { SpinnerIcon } from '../icons/Spinner';

export function Table({ images }: { images: ImageStat[] }) {
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
    <div className="relative rounded-xl overflow-auto border mt-4">
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
              <td>
                {formatNumber(img.file_size)} (
                {byteSize(img.file_size).toString()})
              </td>
              <td>
                {img.compressed_file_size
                  ? `${formatNumber(img.compressed_file_size)} (${byteSize(
                      img.compressed_file_size
                    ).toString()})`
                  : 'N/A'}
              </td>
              <td>
                {renderSaving({
                  progress: img.progress,
                  saving: img.saving,
                  compressed: img.compressed_file_size !== 0,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
