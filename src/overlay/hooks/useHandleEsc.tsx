
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { COMMAND } from "../../constant";

export const useHandleEsc = () => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Add your logic here for what should happen when ESC is pressed
        invoke(COMMAND.STOP_SCREENSHOT);
      }
    };

    window.addEventListener("keydown", handleEsc);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);
};
