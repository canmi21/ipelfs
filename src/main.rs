use std::io;
use std::io::ErrorKind;

mod log;
mod config;

fn main() {
    match config::Config::load() {
        Ok(_) => {}
        //Ok(cfg) => println!("{:#?}", cfg),
        Err(e) => {
            if let Some(io_err) = e.downcast_ref::<io::Error>() {
                if io_err.kind() == ErrorKind::PermissionDenied {
                    log::warn(&format!("failed to load config: {}", io_err));
                    log::action("if this is your first time running, try: sudo ipelfs");
                    return;
                }
            }
            log::warn(&format!("failed to load config: {}", e));
        }
    }
}
