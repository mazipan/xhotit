use mozjpeg_sys::*;
use std::{ffi::CString, mem, path::Path, sync::mpsc, thread};
use tauri::{AppHandle, Emitter};

use super::shared::{DecoderParam, ImageResponse};
use crate::constant::ON_FINISH_COMPRESS_EVENT;

pub struct EncoderParam {
    pub buffer: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub quality: i32,
    pub dest: String,
    pub app: AppHandle,
    pub overwrite: bool,
}

pub fn process_jpeg(app_handle: AppHandle, path_str: &str, q: i32, overwrite: bool) {
    let is_file_exist = Path::new(&path_str).exists();

    if is_file_exist {
        let (tx_decoder, rx_decoder) = mpsc::channel::<DecoderParam>();
        let (tx_encoder, rx_encoder) = mpsc::channel::<EncoderParam>();

        // Sending the path to be encode in the background
        tx_decoder
            .send(DecoderParam {
                path: String::from(path_str),
                app: app_handle,
                filter: String::from(""), // Empty for jpeg
                overwrite: overwrite,
                quality: q,
            })
            .unwrap();

        thread::spawn(move || {
            loop {
                let job = rx_decoder.recv();
                match job {
                    Ok(job) => {
                        let res = unsafe { decode_jpeg(&job.path) };

                        // parameter to be pass to encoder (compress then write new file)
                        let p = EncoderParam {
                            buffer: res.0,
                            width: res.1,
                            height: res.2,
                            quality: job.quality,
                            dest: job.path,
                            app: job.app,
                            overwrite: job.overwrite,
                        };

                        // Pass to the next thread
                        tx_encoder.send(p).unwrap();
                    }
                    Err(_) => break,
                }
            }
        });

        drop(tx_decoder);

        thread::spawn(move || loop {
            let job = rx_encoder.recv();
            match job {
                Ok(job) => {
                    let origin_path = String::from(&job.dest);
                    let dest_path = get_dest_path_jpg(&origin_path, job.overwrite);

                    unsafe {
                        encode_jpeg(&job.buffer, job.width, job.height, job.quality, &dest_path)
                    };

                    let payload = ImageResponse {
                        origin: origin_path,
                        compressed: dest_path.to_string(),
                    };

                    job.app.emit(ON_FINISH_COMPRESS_EVENT, payload).unwrap();
                }
                Err(_) => break,
            }
        });

        // drop(tx_encoder);
    }
}

unsafe fn decode_jpeg(file_name: &str) -> (Vec<u8>, u32, u32) {
    println!("Decoded image {}", file_name);
    let mut err: jpeg_error_mgr = mem::zeroed();
    let mut cinfo: jpeg_decompress_struct = mem::zeroed();
    cinfo.common.err = jpeg_std_error(&mut err);
    jpeg_create_decompress(&mut cinfo);

    let c_file_name = CString::new(file_name.as_bytes()).unwrap();
    let fh = libc::fopen(c_file_name.as_ptr(), b"rb\0".as_ptr().cast());
    if fh.is_null() {
        panic!("Can't open {}", file_name);
    }
    jpeg_stdio_src(&mut cinfo, fh);
    jpeg_read_header(&mut cinfo, true as boolean);

    let width = cinfo.image_width;
    let height = cinfo.image_height;

    println!("Image size {}x{}", width, height);

    cinfo.out_color_space = J_COLOR_SPACE::JCS_RGB;
    jpeg_start_decompress(&mut cinfo);
    let row_stride = cinfo.image_width as usize * cinfo.output_components as usize;
    let buffer_size = row_stride * cinfo.image_height as usize;
    let mut buffer = vec![0u8; buffer_size];

    while cinfo.output_scanline < cinfo.output_height {
        let offset = cinfo.output_scanline as usize * row_stride;
        let mut jsamparray = [buffer[offset..].as_mut_ptr()];
        jpeg_read_scanlines(&mut cinfo, jsamparray.as_mut_ptr(), 1);
    }

    println!("Decoded into {} raw pixel bytes", buffer.len());

    jpeg_finish_decompress(&mut cinfo);
    jpeg_destroy_decompress(&mut cinfo);
    libc::fclose(fh);

    (buffer, width, height)
}

unsafe fn encode_jpeg(buffer: &[u8], width: u32, height: u32, quality: i32, dest: &String) {
    println!("Writing {}", &dest);

    let c_file_name = CString::new(dest.clone()).unwrap();
    let fh = libc::fopen(c_file_name.as_ptr(), b"wb\0".as_ptr().cast());

    if fh.is_null() {
        panic!("Can't write {}", &dest);
    }

    let mut err = mem::zeroed();
    let mut cinfo: jpeg_compress_struct = mem::zeroed();
    cinfo.common.err = jpeg_std_error(&mut err);
    jpeg_create_compress(&mut cinfo);
    jpeg_stdio_dest(&mut cinfo, fh);

    cinfo.image_width = width;
    cinfo.image_height = height;
    cinfo.in_color_space = J_COLOR_SPACE::JCS_RGB;
    cinfo.input_components = 3;
    jpeg_set_defaults(&mut cinfo);

    let row_stride = cinfo.image_width as usize * cinfo.input_components as usize;
    cinfo.dct_method = J_DCT_METHOD::JDCT_ISLOW;

    // Set quality
    jpeg_set_quality(&mut cinfo, quality, true as boolean);

    jpeg_start_compress(&mut cinfo, true as boolean);

    while cinfo.next_scanline < cinfo.image_height {
        let offset = cinfo.next_scanline as usize * row_stride;
        let jsamparray = [buffer[offset..].as_ptr()];
        jpeg_write_scanlines(&mut cinfo, jsamparray.as_ptr(), 1);
    }

    jpeg_finish_compress(&mut cinfo);
    jpeg_destroy_compress(&mut cinfo);

    libc::fclose(fh);
}

// unsafe fn get_jpeg_size(file_name: &str) -> (u32, u32) {
//     let mut err: jpeg_error_mgr = mem::zeroed();
//     let mut cinfo: jpeg_decompress_struct = mem::zeroed();
//     cinfo.common.err = jpeg_std_error(&mut err);
//     jpeg_create_decompress(&mut cinfo);

//     let c_file_name = CString::new(file_name.as_bytes()).unwrap();
//     let fh = libc::fopen(c_file_name.as_ptr(), b"rb\0".as_ptr().cast());
//     if fh.is_null() {
//         panic!("Can't open {}", file_name);
//     }
//     jpeg_stdio_src(&mut cinfo, fh);
//     jpeg_read_header(&mut cinfo, true as boolean);

//     let width = cinfo.image_width;
//     let height = cinfo.image_height;

//     libc::fclose(fh);

//     (width, height)
// }

pub fn get_dest_path_jpg(path_str: &str, overwrite: bool) -> String {
    if !path_str.contains(".min") && !overwrite {
        return replace_jpg_ext(path_str);
    } else {
        return String::from(path_str);
    }
}

fn replace_jpg_ext(path_str: &str) -> String {
    let res = &path_str
        .replace(".jpg", ".min.jpg")
        .replace(".JPG", ".min.jpg")
        .replace(".jpeg", ".min.jpeg")
        .replace(".JPEG", ".min.jpeg");

    let str = String::from(res);

    return str;
}
