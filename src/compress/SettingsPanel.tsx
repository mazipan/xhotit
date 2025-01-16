import clsx from 'clsx';
import { PngFilter, PngFilterEnum, useCompressAppStore } from './store';
import { InformationCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';

export function SettingsPanel({ show }: { show: boolean }) {
  const {
    settings,
    setSettingQuality,
    setSettingFilter,
    toggleSettingOverwrite,
  } = useCompressAppStore();

  return (
    <div
      className={clsx(
        'fixed top-20 right-4 z-20 rounded-lg w-[250px] max-h-[calc(100%-5rem)] transition-all duration-500 transform shadow-lg bg-slate-50 dark:bg-slate-800 shadow-xl',
        show ? 'translate-x-0' : 'translate-x-[110%]'
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto gap-4 p-4">
        <div className="w-full">
          <div className="flex justify-between gap-2 flex-wrap items-center">
            <h2 className="font-bold">Overwrite</h2>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value={settings.overwrite ? 'yes' : 'no'}
                className="sr-only peer"
                onChange={() => {
                  toggleSettingOverwrite();
                }}
                defaultChecked={settings.overwrite}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-xs text-gray-400 leading-none mt-2">
            We will overwrite original file rather than creating the new one.
          </p>
        </div>

        <div className="w-full">
          <div className="flex justify-between gap-2 flex-wrap items-center">
            <h2 className="font-bold">Quality</h2>
            <small className="text-xs text-gray-400">{settings.quality}</small>
          </div>
          <input
            type="range"
            min="50"
            max="90"
            value={settings.quality}
            onChange={(e) => {
              const newVal = e.target.value || '0';
              setSettingQuality(parseInt(newVal, 10));
            }}
            className="w-full mt-2"
          />
        </div>

        <div className="w-full">
          <div className="flex items-center gap-2 justify-between">
            <h2 className="font-bold">
              Filter
            </h2>
            <div className='has-tooltip'>
              <div className='tooltip rounded-lg shadow-lg p-3 -mt-52 text-gray-400 text-xs w-[300px] right-4 bg-slate-100 dark:bg-slate-900'>
                <b className='flex items-center gap-1'><PhotoIcon className='size-4' /> Applicable for PNG only.</b>
                <ul className='space-y-2 mt-2'>
                  <li><b>MINSUM</b>: Use filter that gives minumum sum, as described in the official PNG filter heuristic.</li>
                  <li><b>ENTROPY</b>: Use the filter type that gives smallest Shannon entropy for this scanline. Depending on the image, this is better or worse than minsum.</li>
                  <li><b>BRUTE_FORCE</b>: Brute-force-search PNG filters by compressing each filter for each scanline. Experimental, very slow, and only rarely gives better compression than minsum.</li>
                </ul>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1 cursor-pointer">What is this? <InformationCircleIcon className="size-4 text-gray-400" /></span>
            </div>
          </div>

          <div className='mt-2'>
            <select
              id="countries"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={settings.filter}
              onChange={(e) => {
                const newVal = e.target.value;
                setSettingFilter(newVal as PngFilter);
              }}
            >
              <option value={PngFilterEnum.MINSUM}>
                {PngFilterEnum.MINSUM}
              </option>
              <option value={PngFilterEnum.ENTROPY}>
                {PngFilterEnum.ENTROPY}
              </option>
              <option value={PngFilterEnum.BRUTE_FORCE}>
                {PngFilterEnum.BRUTE_FORCE}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
