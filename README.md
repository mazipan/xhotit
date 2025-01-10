# 📸 Xhot It

Xhot it (read as "shot it") is just another screenshot app in your desktop: an experimental application. powered by [Tauri v2](https://v2.tauri.app/).

![Screenshot](./screenshot.png)

![Screen Record](./screenrecord.gif)

## Features

- **🖼️ Capture Area**: capture screenshot using free selection
- **🪟 Capture Active Window**: capture the active window only
- **🖥️ Capture Screen**: capture the whole screen
- **🎨 Backdrop Background**: setting backdrop background

## Enable screen recording in Mac

▶️ https://support.apple.com/en-ca/guide/mac-help/mchld6aa7d23/mac

## Development

Prerequisites

+ `bun`: https://bun.sh/docs/cli/install
+ `rust`: https://www.rust-lang.org/tools/install

Install deps

```bash
bun install
```

Run app in your local

```bash
bun run tdev
```

## Credits

+ [dimaportenko/code-helper](https://github.com/dimaportenko/code-helper) for the base code
+ [screenshots](https://crates.io/crates/screenshots) and [xcap](https://crates.io/crates/xcap) for capturing screen
+ [active-win-pos-rs](https://crates.io/crates/active-win-pos-rs/) to detect active window position