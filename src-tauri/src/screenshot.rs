use active_win_pos_rs::get_active_window;
use screenshots::Screen;
use serde::Deserialize;
use std::{fs, path::PathBuf, time::Instant};

use tauri::{AppHandle, Emitter};

use crate::{
    app_directory::get_app_directory,
    constant::{
        APP_DOWNLOAD_DIR, ON_CAPTURE_MONITOR_EVENT, ON_GET_ACTIVE_WINDOW_EVENT, ON_SCREENSHOT_EVENT,
    },
    overlay::open_main_window,
};

// TODO: Migrate to XCap: https://github.com/nashaofu/xcap
pub fn capture_screen(selection: &SelectionCoords, file_path: &PathBuf) {
    let start = Instant::now();
    let screen = Screen::from_point(0, 0).unwrap();
    println!("capturer {screen:?}");

    let x: i32;
    let y: i32;
    let width: u32;
    let height: u32;
    if selection.target.0 > selection.origin.0 {
        x = selection.origin.0;
        width = (selection.target.0 - selection.origin.0) as u32;
    } else {
        x = selection.target.0;
        width = (selection.origin.0 - selection.target.0) as u32;
    }

    if selection.target.1 > selection.origin.1 {
        y = selection.origin.1;
        height = (selection.target.1 - selection.origin.1) as u32;
    } else {
        y = selection.target.1;
        height = (selection.origin.1 - selection.target.1) as u32;
    }

    // FIXME: crash on 0 width or height
    if (width == 0) || (height == 0) {
        return;
    }

    let image = screen.capture_area(x, y, width, height).unwrap();

    image.save(file_path).unwrap();
    println!("Runtime: {:?}", start.elapsed());
}

#[derive(Debug, Deserialize)]
pub struct SelectionCoords {
    pub origin: (i32, i32),
    pub target: (i32, i32),
}

pub fn get_screenshot_path(app_handle: &AppHandle) -> PathBuf {
    let mut app_dir = get_app_directory(app_handle, Some(APP_DOWNLOAD_DIR.to_string())).unwrap();

    if !app_dir.exists() {
        match fs::create_dir_all(&app_dir) {
            Ok(_) => println!("Directories created successfully"),
            Err(e) => println!("Error creating directories: {}", e),
        }
    } else {
        println!("Path already exists");
    }

    // generate timestamp screenshot name
    let screenshot_name = chrono::Local::now()
        .format("xhot-%Y-%m-%d_%H-%M-%S.png")
        .to_string();

    app_dir.push(screenshot_name);
    app_dir
}

// TODO: Migrate to XCap: https://github.com/nashaofu/xcap
pub fn capture_window(app_handle: &AppHandle) {
    app_handle
        .emit(ON_GET_ACTIVE_WINDOW_EVENT, "start")
        .unwrap();

    // Read https://github.com/dimusic/active-win-pos-rs
    match get_active_window() {
        Ok(active_window) => {
            let screenshot_path = get_screenshot_path(&app_handle);

            let screen = Screen::from_point(0, 0).unwrap();
            let image = screen
                .capture_area(
                    active_window.position.x as i32,
                    active_window.position.y as i32,
                    active_window.position.width as u32,
                    active_window.position.height as u32,
                )
                .unwrap();

            image.save(&screenshot_path).unwrap();

            app_handle
                .emit(ON_SCREENSHOT_EVENT, screenshot_path)
                .unwrap();

            open_main_window(&app_handle);
        }
        Err(()) => {
            app_handle
                .emit(ON_GET_ACTIVE_WINDOW_EVENT, "error")
                .unwrap();

            println!("Error occurred while getting the active window");
        }
    }
}

// TODO: Migrate to XCap: https://github.com/nashaofu/xcap
pub fn capture_monitor(app_handle: &AppHandle) {
    app_handle.emit(ON_CAPTURE_MONITOR_EVENT, "start").unwrap();

    let screenshot_path = get_screenshot_path(&app_handle);

    let screen = Screen::from_point(0, 0).unwrap();
    let image = screen
        .capture()
        .unwrap();

    image.save(&screenshot_path).unwrap();

    app_handle
        .emit(ON_SCREENSHOT_EVENT, screenshot_path)
        .unwrap();

    open_main_window(&app_handle);
}
