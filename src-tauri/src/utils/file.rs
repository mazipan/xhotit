use base64::{engine::general_purpose, Engine};
use std::fs::File;
use std::io::prelude::*;

pub fn encode_image_to_base64(file_path: &str) -> Result<String, std::io::Error> {
    let mut file = File::open(file_path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    let base64 = general_purpose::STANDARD.encode(&buffer);

    Ok(base64)
}

pub fn normalized(filename: &str) -> String {
    filename
        .replace("|", "")
        .replace("\\", "")
        .replace(":", "")
        .replace("/", "")
}
