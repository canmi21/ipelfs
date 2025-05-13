use chrono::Timelike;
use std::io;
use std::io::ErrorKind;

mod config;

fn main() {
    match config::Config::load() {
        Ok(cfg) => println!("{:#?}", cfg),
        Err(e) => {
            let time = chrono::Local::now();
            let timestamp = format!("{:02}:{:02}:{:02}", time.hour(), time.minute(), time.second());

            // unwrap inner io::Error if possible
            if let Some(io_err) = e.downcast_ref::<io::Error>() {
                if io_err.kind() == ErrorKind::PermissionDenied {
                    println!(
                        "{} ! failed to load config: {}",
                        timestamp, io_err
                    );
                    println!(
                        "{} > permission denied - if this is your first time running, try: sudo ipelfs",
                        timestamp
                    );
                    return;
                }
            }

            println!(
                "{} ! failed to load config: {}",
                timestamp, e
            );
        }
    }
}
