use serde::{Deserialize, Serialize};
use std::fmt;
use tauri::AppHandle;

#[derive(Serialize, Deserialize)]
pub struct ImageParams {
    pub src: String,
    pub public_src: String,
    pub name: String,
    pub file_size: i32,
    pub compressed_file_size: i32,
    pub saving: i32,
    pub quality: i32,
    pub overwrite: bool,
    pub filter: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ImageResponse {
    pub origin: String,
    pub compressed: String,
}

impl fmt::Display for ImageParams {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "ImageParams:: src:{}, name:{}, file_size: {}",
            self.src, self.name, self.file_size
        )
    }
}

pub struct DecoderParam {
    pub path: String,
    pub app: AppHandle,
    pub quality: i32,
    pub overwrite: bool,
    pub filter: String,
}

