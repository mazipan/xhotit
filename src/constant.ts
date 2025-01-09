// Should be same with "src-tauri/src/main.rs"
export const COMMAND = {
  OPEN_OVERLAY: "open_overlay",
  STOP_SCREENSHOT: "stop_screenshot",
  GET_SCREENSHOT_FILES: "get_screenshot_files",
  OPEN_APP_DIR: "open_app_directory",
  SCREENSHOT: "screenshot",
  SCREENSHOT_ACTIVE_WINDOW: "screenshot_active_window",
} as const

export const EVENT = {
  ON_SCREENSHOT: "on_screenshot",
  ON_GET_ACTIVE_WINDOW: "on_get_active_window"
} as const