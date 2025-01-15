#![deny(clippy::all)]
use std::fmt;
use std::sync::mpsc;
use std::thread;

use mozjpeg_sys::*;
use serde::{Deserialize, Serialize};
use std::ffi::CString;
use std::mem;
use tauri::{AppHandle, Emitter};

use crate::constant::ON_FINISH_COMPRESS_EVENT;

#[derive(Serialize, Deserialize)]
pub struct ImageParams {
    pub src: String,
    pub public_src: String,
    pub name: String,
    pub file_size: i32,
    pub compressed_file_size: i32,
    pub saving: i32,
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
}

pub struct EncoderParam {
    pub buffer: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub quality: i32,
    pub dest: String,
    pub app: AppHandle,
}

pub fn process_jpeg(app_handle: AppHandle, path_str: &str) {
    let (tx_decoder, rx_decoder) = mpsc::channel::<DecoderParam>();
    let (tx_encoder, rx_encoder) = mpsc::channel::<EncoderParam>();

    // Sending the path to be encode in the background
    tx_decoder
        .send(DecoderParam {
            path: String::from(path_str),
            app: app_handle,
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
                        // New Image Quality --> Hardcoded for now
                        quality: 70,
                        dest: job.path,
                        app: job.app,
                    };

                    // Pass to the next thread
                    tx_encoder.send(p).unwrap();
                }
                Err(_) => break,
            }
        }
    });

    thread::spawn(move || loop {
        let job = rx_encoder.recv();
        match job {
            Ok(job) => {
                let origin_path = String::from(&job.dest);
                let dest_path = &origin_path.replace(".jpg", ".min.jpg").replace(".jpeg", ".min.jpeg");

                unsafe { encode_jpeg(&job.buffer, job.width, job.height, job.quality, &dest_path) };

                let payload = ImageResponse {
                    origin: origin_path,
                    compressed: dest_path.to_string(),
                };

                job.app
                    .emit(ON_FINISH_COMPRESS_EVENT, payload)
                    .unwrap();
            }
            Err(_) => break,
        }
    });
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

unsafe fn get_jpeg_size(file_name: &str) -> (u32, u32) {
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

    libc::fclose(fh);

    (width, height)
}
