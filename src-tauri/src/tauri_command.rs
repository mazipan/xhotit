use std::{path::PathBuf, process::Command as ProcessCommand};
use tauri::{command, AppHandle, Emitter, Manager};

use crate::{
    app_directory::{get_app_directory, list_images_in_directory_sorted},
    overlay::toggle_overlay_window,
    screenshot::{capture_screen, get_screenshot_path},
    screenshot::{capture_window, SelectionCoords, APP_DOWNLOAD_DIR, ON_SCREENSHOT_EVENT},
};

/**
 * When trigger capture area using Overlay
 */
#[command]
pub fn screenshot(app_handle: AppHandle, coords: SelectionCoords) {
    let overlay = app_handle.get_webview_window("overlay").unwrap();
    if !overlay.is_visible().unwrap() {
        return;
    }

    let screenshot_path = get_screenshot_path(&app_handle);

    capture_screen(&coords, &screenshot_path);

    app_handle
        .emit(ON_SCREENSHOT_EVENT, screenshot_path)
        .unwrap();

    toggle_overlay_window(&app_handle);
}

/**
 * When enter Escape on screen capture process
 */
#[command]
pub fn stop_screenshot(app_handle: AppHandle) {
    toggle_overlay_window(&app_handle);
}

/**
 * When click menu item capture active window
 */
#[command]
pub fn screenshot_active_window(app: AppHandle) {
    capture_window(&app)
}

/**
 * When fetching existing images from downloads directory
 */
#[command]
pub fn get_screenshot_files(app: AppHandle) -> Option<Vec<String>> {
    list_images_in_directory_sorted(&app, Some(APP_DOWNLOAD_DIR.to_string()))
}

/**
 * When open directory button in Main App
 */
#[command]
pub fn open_app_directory(app: AppHandle, subdirectory: Option<String>) {
    let path: PathBuf =
        get_app_directory(&app, subdirectory).expect("Error: can't get app directory");
    if path.is_dir() {
        // Open the directory using the system's default file explorer
        #[cfg(target_os = "windows")]
        ProcessCommand::new("explorer")
            .arg(path)
            .spawn()
            .expect("ERROR: Failed to open directory");

        #[cfg(target_os = "macos")]
        ProcessCommand::new("open")
            .arg(path)
            .spawn()
            .expect("ERROR: Failed to open directory");

        #[cfg(target_os = "linux")]
        ProcessCommand::new("xdg-open")
            .arg(path)
            .spawn()
            .expect("ERROR: Failed to open directory");
    }
}