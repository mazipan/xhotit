use crate::{
    constant::ON_FINISH_COMPRESS_EVENT,
    image_compressor::shared::{DecoderParam, ImageResponse},
};
use lodepng::FilterStrategy;
use std::{path::Path, sync::mpsc, thread};
use tauri::{AppHandle, Emitter};

pub fn process_png(app_handle: AppHandle, path_str: &str, q: i32, overwrite: bool, filter: String) {
    let is_file_exist = Path::new(&path_str).exists();

    if is_file_exist {
        let (tx_png, rx_png) = mpsc::channel();

        tx_png
            .send(DecoderParam {
                path: String::from(path_str),
                app: app_handle,
                filter: String::from(filter),
                overwrite: overwrite,
                quality: q,
            })
            .unwrap();

        thread::spawn(move || loop {
            let job = rx_png.recv();
            match job {
                Ok(job) => {
                    let path = Path::new(&job.path);
                    let source_png = std::fs::read(&path).unwrap();

                    let source_len = source_png.len();
                    let mut decoder = lodepng::Decoder::new();

                    let img = decoder
                        .decode(source_png)
                        .map_err(|e| format!("Can't decode {}: {e}", job.path))
                        .unwrap();

                    println!(
                        "Original size: {} bytes ({}x{} {:?})",
                        source_len,
                        img.width(),
                        img.height(),
                        decoder.info_raw().colortype()
                    );

                    let mut encoder = lodepng::Encoder::new();
                    encoder.set_auto_convert(true);
                    encoder.settings_mut().set_level(9);
                    *encoder.info_raw_mut() = decoder.info_raw().clone();
                    encoder.info_png_mut().color = decoder.info_raw().clone();

                    if job.filter == "ENTROPY" {
                        encoder.set_filter_strategy(FilterStrategy::ENTROPY, false);
                    } else if job.filter == "BRUTE_FORCE" {
                        encoder.set_filter_strategy(FilterStrategy::BRUTE_FORCE, false);
                    } else {
                        encoder.set_filter_strategy(FilterStrategy::MINSUM, false);
                    }

                    let new_png = encoder
                        .encode(img.bytes(), img.width(), img.height())
                        .unwrap();

                    let dest_path: &str = &get_dest_path_png(&job.path, job.overwrite);

                    let payload = ImageResponse {
                        origin: job.path.to_string(),
                        compressed: dest_path.to_string(),
                    };

                    std::fs::write(&dest_path, new_png).unwrap();
                    job.app.emit(ON_FINISH_COMPRESS_EVENT, payload).unwrap();
                }
                Err(_) => break,
            }
        });

        drop(tx_png);
    }
}


pub fn get_dest_path_png(path_str: &str, overwrite: bool) -> String {
    if !path_str.contains(".min") && !overwrite {
        return replace_png_ext(path_str);
    } else {
        return String::from(path_str);
    }
}

fn replace_png_ext(path_str: &str) -> String {
    let res = &path_str
        .replace(".png", ".min.png")
        .replace(".PNG", ".min.png");

    let str = String::from(res);

    return str;
}