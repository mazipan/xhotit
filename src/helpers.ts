export type ScreenshotItem = {
  filePath: string;
  assetPath: string;
};

export function getAssetFilename (str?: ScreenshotItem) {
  if (!str) {
    return ''
  }
  const parts = str?.assetPath.split("%2F");
  return parts[parts.length - 1]
}