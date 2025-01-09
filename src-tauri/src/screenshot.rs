use fs_extra::dir;
use screenshots::Screen;
use serde::Deserialize;
use std::{fs, path::PathBuf, time::Instant};
use xcap::Window;

use tauri::AppHandle;

use crate::{app_directory::get_app_directory, overlay::open_main_window};

pub const ON_SCREENSHOT_EVENT: &str = "on_screenshot";
// Directory target
pub const APP_DOWNLOAD_DIR: &str = "xhotit-screenshots";

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
    // FIXME: save file to proper location
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

pub fn capture_window(app_handle: &AppHandle) {
    let windows = Window::all().unwrap();

    dir::create_all("target/windows", true).unwrap();

    for window in windows {
        if window.is_minimized() || window.app_name() == "Dock" || window.app_name() == "xhotit" {
            continue;
        }

        println!("> Capture window app : {}", window.app_name(),);

        let screenshot_path = get_screenshot_path(&app_handle);
        let image = window.capture_image().unwrap();

        image.save(screenshot_path).unwrap();
    }

    open_main_window(app_handle)
}
