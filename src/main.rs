use std::io;
use std::io::ErrorKind;

mod log;
mod config;
mod cli;

use clap::Parser;
use cli::{Cli, Commands, AddTarget};

fn main() {
    match config::Config::load() {
        Ok(_) => {}
        Err(e) => {
            if let Some(io_err) = e.downcast_ref::<io::Error>() {
                if io_err.kind() == ErrorKind::PermissionDenied {
                    log::warn(&format!("failed to load config: {}", io_err));
                    log::action("if this is your first time running, try: sudo ipelfs");
                    return;
                }
            }
            log::warn(&format!("failed to load config: {}", e));
            return;
        }
    }

    let cli = Cli::parse();

    match &cli.command {
        Commands::Add { target } => match target {
            AddTarget::Volume { path } => {
                log::action(&format!("add volume requested: {}", path));
            }
        },
    }
}
