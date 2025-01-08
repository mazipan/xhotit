import { useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { ScreenshotItem } from "../../helpers";

export const useScreenshotList = () => {
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const getScreenshotsData = async () => {
    console.log("Getting file paths...");
    invoke("get_screenshot_files")
      .then((files) => {
        const fileSrcs = (files as string[]).map((file) => {
          console.log("file: ", file);
          return {
            filePath: file,
            assetPath: convertFileSrc(file),
          };
        });

        setScreenshots(fileSrcs);
      })
      .catch((error) =>
        console.error("Failed to get screenshot files:", error),
      );
  };

  return {
    screenshots,
    getScreenshotsData,
  };
};
