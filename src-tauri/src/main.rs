// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_command;
mod app_directory;
mod app_menu;
mod app_win_manager;
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
use std::backtrace;
use std::io::Write;
use tauri::tray::TrayIconBuilder;
use tauri_plugin_opener::OpenerExt;

fn main() {
    std::panic::set_hook(Box::new(|info| {
        let backtrace = backtrace::Backtrace::force_capture();
        println!("panic occurred: {:?}", info);

        let _ = std::fs::File::create("xhotit_panic.log")
            .and_then(|mut f| f.write_all(format!("{:?}\n{:#?}", info, backtrace).as_bytes()));

        std::process::exit(1);
    }));

    // Based on issue: https://github.com/tauri-apps/tauri/issues/7063
    // https://github.com/tauri-apps/fix-path-env-rs
    // #[cfg(not(target_os="windows"))]
    if let Err(e) = fix() {
        println!("{}", e);
    }

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Warn)
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    },
                ))
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let mb = get_menu_builder(app).build()?;

            let _tray = TrayIconBuilder::with_id("xhotit-tray")
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
        .expect("ERROR: error while running Xhot It");
}
