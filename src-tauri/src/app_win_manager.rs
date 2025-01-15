use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

use crate::constant::{ON_REOPEN_APP_EVENT, WINDOW_COMPRESS_ID, WINDOW_MAIN_ID, WINDOW_OVERLAY_ID};

pub fn toggle_window(overlay: &WebviewWindow) {
    if overlay.is_visible().unwrap() {
        overlay.hide().unwrap();
    } else {
        overlay.show().unwrap();
        overlay.set_focus().unwrap();
    }
}

pub fn create_overlay_window(app: &AppHandle) {
    let web_view_url = format!("index.html?window_id={}", WINDOW_OVERLAY_ID);

    let win_builder =
        WebviewWindowBuilder::new(app, WINDOW_OVERLAY_ID, WebviewUrl::App(web_view_url.into()));

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

pub fn create_compress_window(app: &AppHandle) {
    let web_view_url = format!("index.html?window_id={}", WINDOW_COMPRESS_ID);

    let win_builder = WebviewWindowBuilder::new(
        app,
        WINDOW_COMPRESS_ID,
        WebviewUrl::App(web_view_url.into()),
    );

    let win = win_builder.resizable(true).title("Xhot It - Compress Image").center().min_inner_size(600.0, 400.0).build().unwrap();

    win.show().unwrap();

    let result = win.set_focus();
    if let Err(_e) = result {
        // println!("Error: {}", e);
    }
}

pub fn open_by_window_id(app_handle: &AppHandle, win_id: &str) {
    let win = app_handle.get_webview_window(win_id);
    if let Some(win) = win {
        win.show().unwrap();
        win.set_focus().unwrap();
    }
}

pub fn hide_by_window_id(app_handle: &AppHandle, win_id: &str) {
    let win = app_handle.get_webview_window(win_id);
    if let Some(win) = win {
        win.hide().unwrap();
    }
}

pub fn open_main_window(app_handle: &AppHandle) {
    open_by_window_id(app_handle, WINDOW_MAIN_ID);
}

pub fn reopen_main_window(app_handle: &AppHandle) {
    open_main_window(app_handle);
    hide_by_window_id(app_handle, WINDOW_COMPRESS_ID);
    app_handle.emit(ON_REOPEN_APP_EVENT, "start").unwrap();
}

pub fn toggle_overlay_window(app: &AppHandle) {
    let overlay = app.get_webview_window(WINDOW_OVERLAY_ID);

    // always hide the compress window
    hide_by_window_id(app, WINDOW_COMPRESS_ID);

    if let Some(overlay) = overlay {
        if overlay.is_visible().unwrap() {
            open_by_window_id(app, WINDOW_MAIN_ID);
        } else {
            hide_by_window_id(app, WINDOW_MAIN_ID);
        }

        toggle_window(&overlay);
    } else {
        hide_by_window_id(app, WINDOW_MAIN_ID);
        create_overlay_window(app);
    }
}

pub fn toggle_compress_window(app: &AppHandle) {
    let win = app.get_webview_window(WINDOW_COMPRESS_ID);

    // always hide the overlay window
    hide_by_window_id(app, WINDOW_OVERLAY_ID);

    if let Some(win) = win {
        if win.is_visible().unwrap() {
            hide_by_window_id(app, WINDOW_COMPRESS_ID);

            open_by_window_id(app, WINDOW_MAIN_ID);
        } else {
            hide_by_window_id(app, WINDOW_MAIN_ID);

            open_by_window_id(app, WINDOW_COMPRESS_ID);
        }
    } else {
        hide_by_window_id(app, WINDOW_MAIN_ID);
        create_compress_window(app);
    }
}
