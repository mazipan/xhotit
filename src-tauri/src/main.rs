// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_command;
mod app_directory;
mod app_win_manager;
mod app_menu;
mod constant;
mod image_compressor;
mod screenshot;

use app_command::{
    exec_compress, get_screenshot_files, open_app_directory, open_compress, open_overlay,
    reset_app, screenshot, screenshot_active_window, screenshot_monitor, stop_screenshot,
};

use app_menu::get_menu_builder;
use app_win_manager::{reopen_main_window, toggle_compress_window, toggle_overlay_window};
use screenshot::{capture_monitor, capture_window};

use fix_path_env::fix;
use tauri::tray::TrayIconBuilder;
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

            let mb = get_menu_builder(app).build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&mb)
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
                    "donate" => {
                        let opener = app.opener();
                        let _ = opener.open_url("https://www.mazipan.space/support", None::<&str>);
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
