
import { invoke } from "@tauri-apps/api/core";
import RectangleSelection, { AreaCoords } from "./selection/RectangleSelection";
import { useHandleEsc } from "./hooks/useHandleEsc";
import { hideCursor, showCursor } from "./utils/cursor";
import { COMMAND } from "../constant";
import clsx from "clsx";

const onSelectionEnd = async (coords: AreaCoords) => {
  try {
    hideCursor();
    await invoke(COMMAND.SCREENSHOT, { coords });
    showCursor();
  } catch (error) {
    console.error("Error when invoke command screenshot", error);
  }
};

export const OverlayAppContainer = () => {
  useHandleEsc();

  return (
    <div id="container" className={clsx('w-full bg-transparent h-screen cursor-crosshair')}>
      <RectangleSelection
        onSelectionEnd={onSelectionEnd}
        style={{
          backgroundColor: "rgba(0,0,255,0.4)",
          borderColor: "blue",
        }}
      >
        <div className="App" />
      </RectangleSelection>
    </div>
  );
};
