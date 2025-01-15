// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_command;
mod app_directory;
mod constant;
mod app_win_manager;
mod screenshot;
mod image_compressor;

use app_command::{
    get_screenshot_files, open_app_directory, open_overlay, reset_app, screenshot,
    screenshot_active_window, screenshot_monitor, stop_screenshot, open_compress, exec_compress,
};

use app_win_manager::{reopen_main_window, toggle_compress_window, toggle_overlay_window};
use screenshot::{capture_monitor, capture_window};

use fix_path_env::fix;
use tauri::{
    image::Image,
    menu::{IconMenuItem, MenuBuilder, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_opener::OpenerExt;

fn main() {
    // Based on issue: https://github.com/tauri-apps/tauri/issues/7063
    // https://github.com/tauri-apps/fix-path-env-rs
    // #[cfg(not(target_os="windows"))]
    if let Err(e) = fix() {
        println!("{}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let capture_area_icon = Image::from_path("./icons/menu/viewfinder-circle.png");
            let capture_area_i = IconMenuItem::with_id(
                app,
                "capture_area",
                "Capture Area",
                true,
                capture_area_icon.ok(),
                Some("CmdOrCtrl+Shift+1"),
            )?;

            let capture_active_icon = Image::from_path("./icons/menu/camera.png");
            let capture_active_i = IconMenuItem::with_id(
                app,
                "capture_active",
                "Capture Active Window",
                true,
                capture_active_icon.ok(),
                Some("CmdOrCtrl+Shift+2"),
            )?;

            let capture_screen_icon = Image::from_path("./icons/menu/computer-desktop.png");
            let capture_screen_i = IconMenuItem::with_id(
                app,
                "capture_screen",
                "Capture Screen",
                true,
                capture_screen_icon.ok(),
                Some("CmdOrCtrl+Shift+3"),
            )?;

            let compress_i =
                MenuItem::with_id(app, "compress_image", "Compress Image", true, Some("CmdOrCtrl+Shift+4"))?;

            let reopen_i =
                MenuItem::with_id(app, "reopen_app", "Reopen Xhot It", true, None::<&str>)?;

            let report_bug_i =
                MenuItem::with_id(app, "report_bug", "Report a Bug", true, None::<&str>)?;

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, Some("CmdOrCtrl+Q"))?;

            let menu_builder = MenuBuilder::new(app)
                .items(&[&capture_area_i, &capture_active_i, &capture_screen_i, &compress_i])
                .separator()
                .items(&[&reopen_i, &report_bug_i, &quit_i])
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu_builder)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "capture_area" => {
                        toggle_overlay_window(app);
                    }
                    "capture_active" => {
                        capture_window(app);
                    }
                    "capture_screen" => {
                        capture_monitor(app);
                    }
                    "compress_image" => {
                        toggle_compress_window(app);
                    }
                    "reopen_app" => {
                        reopen_main_window(app);
                    }
                    "report_bug" => {
                        let opener = app.opener();
                        let _ = opener.open_url("https://github.com/mazipan/xhotit", None::<&str>);
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {
                        println!("Menu item {:?} not handled", event.id);
                    }
                })
                .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Should be same with "src/constant.ts"
            screenshot,
            screenshot_active_window,
            screenshot_monitor,
            open_overlay,
            stop_screenshot,
            open_app_directory,
            get_screenshot_files,
            reset_app,
            open_compress,
            exec_compress,
        ])
        .run(tauri::generate_context!())
        .expect("ERROR: error while running tauri application");
}
