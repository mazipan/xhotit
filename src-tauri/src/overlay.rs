use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

use crate::constant::ON_REOPEN_APP_EVENT;

pub fn toggle_window(overlay: &WebviewWindow) {
    if overlay.is_visible().unwrap() {
        overlay.hide().unwrap();
    } else {
        overlay.show().unwrap();
        overlay.set_focus().unwrap();
    }
}

pub fn create_overlay_window(app: &AppHandle) {
    let win_builder = WebviewWindowBuilder::new(
        app,
        "overlay",
        WebviewUrl::App("index.html?window_id=overlay".into()),
    );

    // set transparent title bar only when building for macOS
    #[cfg(target_os = "macos")]
    let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

    let window = win_builder
        .always_on_top(true)
        .resizable(false)
        .transparent(true)
        .decorations(false)
        .build()
        .unwrap();

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSMainMenuWindowLevel, NSWindow};
        use cocoa::base::id;
        let ns_win = window.ns_window().unwrap() as id;
        unsafe {
            // kCGMainMenuWindowLevelKey: NSInteger = 8;
            // kCGScreenSaverWindowLevelKey: NSInteger = 13;
            // 13 - 8 = 5
            ns_win.setLevel_(((NSMainMenuWindowLevel + 5) as u64).try_into().unwrap());
        }
    }

    let pos = PhysicalPosition::new(0.0, 0.0);
    let _ = window.set_position(pos);

    let monitor = match window.current_monitor() {
        Ok(mon) => mon,
        Err(_) => panic!("No monitor found!"),
    }
    .unwrap();

    let physical_size = monitor.size();
    let _ = window.set_size(*physical_size);

    window.show().unwrap();

    let result = window.set_focus();
    if let Err(_e) = result {
        // println!("Error: {}", e);
    }
}

pub fn open_main_window(app: &AppHandle) {
    let main: tauri::WebviewWindow = app.get_webview_window("main").unwrap();
    main.show().unwrap();
    main.set_focus().unwrap();
}

pub fn reopen_main_window(app_handle: &AppHandle) {
    open_main_window(app_handle);
    app_handle.emit(ON_REOPEN_APP_EVENT, "start").unwrap();
}

pub fn toggle_overlay_window(app: &AppHandle) {
    let main: tauri::WebviewWindow = app.get_webview_window("main").unwrap();
    let overlay = app.get_webview_window("overlay");

    if let Some(overlay) = overlay {
        if overlay.is_visible().unwrap() {
            main.show().unwrap();
        } else {
            main.hide().unwrap();
        }

        toggle_window(&overlay);
    } else {
        main.hide().unwrap();
        create_overlay_window(app);
    }
}
