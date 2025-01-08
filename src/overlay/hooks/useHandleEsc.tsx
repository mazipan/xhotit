
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

export const useHandleEsc = () => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("ESC pressed");
        // Add your logic here for what should happen when ESC is pressed
        invoke("stop_screenshot");
      }
    };

    window.addEventListener("keydown", handleEsc);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);
};
