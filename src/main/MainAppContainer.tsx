
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { Allotment } from "allotment";
import "allotment/dist/style.css";

import { ScreenshotList } from "./screenshots/ScreenshotList";
import { useState } from "react";
import { getAssetFilename, ScreenshotItem } from "../helpers";

const handleOpenAppDirectory = () => {
  invoke("open_app_directory", { subdirectory: "screenshots" }).catch((err) =>
    console.error("Error opening app directory:", err)
  );
};

export const MainAppContainer = () => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<
    ScreenshotItem | undefined
  >();

  return (
    <div className="container">
      <Allotment vertical={false}>
        <Allotment.Pane maxSize={200}>
          <div className="flex flex-col max-w-[200px] p-1 border-r border-r-gray-500/30 h-full">
            <div className="flex flex-col flex-1 overflow-y-auto p-2">
              <ScreenshotList
                onSelectedChange={(screenshot: ScreenshotItem | undefined) => {
                  setSelectedScreenshot(screenshot);
                }}
              />
            </div>

            <div className="flex justify-center p-1 pt-2">
              <button onClick={handleOpenAppDirectory}>Open Directory</button>
            </div>
          </div>
        </Allotment.Pane>

        <div className="flex flex-col items-start gap-6">
          <h1>{getAssetFilename(selectedScreenshot)}</h1>

          <div className="flex flex-row">
            <img
              src={selectedScreenshot?.assetPath}
              alt="Screenshot"
              className="w-[300px] max-h-[300px] object-contain"
            />
          </div>
        </div>

        <div id="preview flex-1">
          Right panel
        </div>
      </Allotment>
    </div>
  );
};
