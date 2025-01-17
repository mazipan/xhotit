use tauri::{
    image::Image,
    menu::{IconMenuItem, MenuBuilder, MenuItem},
    App, Manager, Theme, Wry,
};

use crate::constant::WINDOW_MAIN_ID;

pub fn get_menu_builder(app: &mut App) -> MenuBuilder<'_, Wry, App> {
    let capture_area_icon = Image::from_path("./icons/menu/viewfinder-circle.png");
    let capture_area_icon_light = Image::from_path("./icons/menu/viewfinder-circle-light.png");

    let capture_area_i = IconMenuItem::with_id(
        app,
        "capture_area",
        "Capture Area",
        true,
        capture_area_icon.ok(),
        Some("CmdOrCtrl+Shift+1"),
    )
    .unwrap();

    let capture_active_icon = Image::from_path("./icons/menu/camera.png");
    let capture_active_icon_light = Image::from_path("./icons/menu/camera-light.png");
    let capture_active_i = IconMenuItem::with_id(
        app,
        "capture_active",
        "Capture Active Window",
        true,
        capture_active_icon.ok(),
        Some("CmdOrCtrl+Shift+2"),
    )
    .unwrap();

    let capture_screen_icon = Image::from_path("./icons/menu/computer-desktop.png");
    let capture_screen_icon_light = Image::from_path("./icons/menu/computer-desktop-light.png");
    let capture_screen_i = IconMenuItem::with_id(
        app,
        "capture_screen",
        "Capture Screen",
        true,
        capture_screen_icon.ok(),
        Some("CmdOrCtrl+Shift+3"),
    )
    .unwrap();

    let compress_icon = Image::from_path("./icons/menu/bolt.png");
    let compress_icon_light = Image::from_path("./icons/menu/bolt-light.png");
    let compress_i = IconMenuItem::with_id(
        app,
        "compress_image",
        "Compress Image",
        true,
        compress_icon.ok(),
        Some("CmdOrCtrl+Shift+4"),
    )
    .unwrap();

    let reopen_i =
        MenuItem::with_id(app, "reopen_app", "Reopen Xhot It", true, None::<&str>).unwrap();

    let report_bug_i =
        MenuItem::with_id(app, "report_bug", "Report a Bug", true, None::<&str>).unwrap();

    let donate_i = MenuItem::with_id(app, "donate", "Donate", true, None::<&str>).unwrap();

    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, Some("CmdOrCtrl+Q")).unwrap();

    let win = app.get_webview_window(WINDOW_MAIN_ID);
    if let Some(win) = win {
        let t = win.theme().ok().unwrap();

        // Set different icon for light theme
        if t == Theme::Light {
            capture_area_i.set_icon(Some(capture_area_icon_light.unwrap())).unwrap();
            capture_active_i.set_icon(Some(capture_active_icon_light.unwrap())).unwrap();
            capture_screen_i.set_icon(Some(capture_screen_icon_light.unwrap())).unwrap();
            compress_i.set_icon(Some(compress_icon_light.unwrap())).unwrap();
        }
    }

    return MenuBuilder::new(app)
        .items(&[
            &capture_area_i,
            &capture_active_i,
            &capture_screen_i,
            &compress_i,
        ])
        .separator()
        .items(&[&reopen_i, &report_bug_i, &donate_i, &quit_i]);
}
