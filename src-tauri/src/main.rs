// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_command::{
    get_screenshot_files, open_app_directory, open_overlay, screenshot, screenshot_active_window,
    screenshot_monitor, stop_screenshot,
};

use overlay::toggle_overlay_window;
use screenshot::{capture_monitor, capture_window};

use tauri::{
    image::Image,
    menu::{IconMenuItem, Menu},
    tray::TrayIconBuilder,
};
use tauri_plugin_opener::OpenerExt;

mod app_command;
mod app_directory;
mod constant;
mod overlay;
mod screenshot;

fn main() {
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

            let report_bug_icon = Image::from_path("./icons/menu/bug-ant.png");
            let report_bug_i = IconMenuItem::with_id(
                app,
                "report_bug",
                "Report a Bug",
                true,
                report_bug_icon.ok(),
                None::<&str>,
            )?;

            let quit_icon = Image::from_path("./icons/menu/arrow-left-start-on-rectangle.png");
            let quit_i = IconMenuItem::with_id(
                app,
                "quit",
                "Quit",
                true,
                quit_icon.ok(),
                Some("CmdOrCtrl+Q"),
            )?;

            let menu = Menu::with_items(
                app,
                &[
                    &capture_area_i,
                    &capture_active_i,
                    &capture_screen_i,
                    &report_bug_i,
                    &quit_i,
                ],
            )?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
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
        ])
        .run(tauri::generate_context!())
        .expect("ERROR: error while running tauri application");
}
