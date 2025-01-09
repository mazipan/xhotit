// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use overlay::toggle_overlay_window;
use screenshot::capture_window;
use tauri_command::{
    get_screenshot_files, open_app_directory, screenshot, screenshot_active_window, stop_screenshot,
};

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};

mod app_directory;
mod overlay;
mod screenshot;
mod tauri_command;
mod utils;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let capture_active_i = MenuItem::with_id(
                app,
                "xhot_active",
                "Xhot Active Window",
                true,
                Some("CmdOrCtrl+Shift+A"),
            )?;

            let capture_i =
                MenuItem::with_id(app, "xhot", "Xhot", true, Some("CmdOrCtrl+Shift+S"))?;

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, Some("Q"))?;

            let menu = Menu::with_items(app, &[&capture_active_i, &capture_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "xhot" => {
                        toggle_overlay_window(app);
                    }
                    "xhot_active" => {
                        capture_window(app);
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
            screenshot,
            screenshot_active_window,
            stop_screenshot,
            open_app_directory,
            get_screenshot_files,
        ])
        .run(tauri::generate_context!())
        .expect("ERROR: error while running tauri application");
}
