use directories::UserDirs;
use std::{fs, path::PathBuf, process::Command as ProcessCommand, time::SystemTime};
use tauri::{command, AppHandle, Manager};

pub fn list_images_in_directory_sorted(
    app: &AppHandle,
    subdirectory: Option<String>,
) -> Option<Vec<String>> {
    let path = get_app_directory(app, subdirectory);

    match path {
        Some(path) => {
            if path.exists() && path.is_dir() {
                let mut entries: Vec<_> = fs::read_dir(path)
                    .expect("Failed to read directory")
                    .filter_map(|res| res.ok())
                    .filter(|entry| {
                        if let Ok(metadata) = entry.metadata() {
                            if metadata.is_file() {
                                // Filter by image file extensions
                                return entry
                                    .path()
                                    .extension()
                                    .map(|ext| {
                                        let ext = ext.to_string_lossy().to_lowercase();
                                        ext == "jpg"
                                            || ext == "jpeg"
                                            || ext == "png"
                                            || ext == "gif"
                                            || ext == "bmp"
                                    })
                                    .unwrap_or(false);
                            }
                        }
                        false
                    })
                    .filter(|entry| entry.path().is_file())
                    .map(|entry| {
                        let path = entry.path();
                        let metadata = fs::metadata(&path).expect("Failed to get metadata");
                        let last_modified = metadata.modified().unwrap_or(SystemTime::UNIX_EPOCH);
                        (path, last_modified)
                    })
                    .collect();

                // Sort files by last modified date
                entries.sort_by(|a, b| b.1.cmp(&a.1));

                Some(
                    entries
                        .into_iter()
                        .map(|(path, _)| path.to_string_lossy().into_owned())
                        .collect(),
                )
            } else {
                None
            }
        }
        None => None,
    }
}

pub fn get_app_directory(app: &AppHandle, subdirectory: Option<String>) -> Option<PathBuf> {
    let user_dirs = UserDirs::new().expect("Failed to get user directories");
    let mut path = user_dirs.download_dir().unwrap().to_path_buf();

    if let Some(subdirectory) = subdirectory {
        path.push(subdirectory);
    }

    Some(path)
}

#[command]
pub fn open_app_directory(app: AppHandle, subdirectory: Option<String>) {
    let path: PathBuf =
        get_app_directory(&app, subdirectory).expect("Error: can't get app directory");
    if path.is_dir() {
        // Open the directory using the system's default file explorer
        #[cfg(target_os = "windows")]
        ProcessCommand::new("explorer")
            .arg(path)
            .spawn()
            .expect("ERROR: Failed to open directory");

        #[cfg(target_os = "macos")]
        ProcessCommand::new("open")
            .arg(path)
            .spawn()
            .expect("ERROR: Failed to open directory");

        #[cfg(target_os = "linux")]
        ProcessCommand::new("xdg-open")
            .arg(path)
            .spawn()
            .expect("ERROR: Failed to open directory");
    }
}
