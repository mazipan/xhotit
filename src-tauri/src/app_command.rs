use std::{path::PathBuf, process::Command as ProcessCommand};
use tauri::{command, AppHandle, Emitter, Manager};

use crate::{
    app_directory::{get_app_directory, list_images_in_directory_sorted},
    app_win_manager::{reopen_main_window, toggle_compress_window, toggle_overlay_window},
    constant::{APP_DOWNLOAD_DIR, ON_SCREENSHOT_EVENT},
    image_compressor::{jpeg::process_jpeg, png::process_png, shared::ImageParams},
    screenshot::{
        capture_monitor, capture_screen, capture_window, get_screenshot_path, SelectionCoords,
    },
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
 * When trigger new flow to capture are, by showing overlay window
 */
#[command]
pub fn open_overlay(app_handle: AppHandle) {
    toggle_overlay_window(&app_handle);
}

/**
 * When click menu item capture active window
 */
#[command]
pub fn screenshot_active_window(app_handle: AppHandle) {
    capture_window(&app_handle)
}

/**
 * When click menu item capture active window
 */
#[command]
pub fn screenshot_monitor(app_handle: AppHandle) {
    capture_monitor(&app_handle)
}

/**
 * When click reopen from menu item
 */
#[command]
pub fn reset_app(app_handle: AppHandle) {
    reopen_main_window(&app_handle);
}

/**
 * When fetching existing images from downloads directory
 */
#[command]
pub fn get_screenshot_files(app_handle: AppHandle) -> Option<Vec<String>> {
    list_images_in_directory_sorted(&app_handle, Some(APP_DOWNLOAD_DIR.to_string()))
}

/**
 * When open directory button in Main App
 */
#[command]
pub fn open_app_directory(app_handle: AppHandle, subdirectory: Option<String>) {
    let path: PathBuf =
        get_app_directory(&app_handle, subdirectory).expect("Error: can't get app directory");
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

/**
 * When trigger open new compress-image window
 */
#[command]
pub fn open_compress(app_handle: AppHandle) {
    toggle_compress_window(&app_handle);
}

/**
 * When trigger click Compress Image
 */
#[command]
pub fn exec_compress(app_handle: AppHandle, image: ImageParams) {
    if image.name.to_lowercase().contains(".png") {
        process_png(
            app_handle,
            &image.src,
            image.quality,
            image.overwrite,
            image.filter,
        )
    } else if image.name.to_lowercase().contains(".jpg")
        || image.name.to_lowercase().contains(".jpeg")
    {
        process_jpeg(app_handle, &image.src, image.quality, image.overwrite)
    }
}
