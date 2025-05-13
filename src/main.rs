use std::io;
use clap::Parser;
use std::io::ErrorKind;
use cli::{Cli, Commands, AddTarget, RemoveTarget, ListTarget};

mod log;
mod cli;
mod config;

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
                let actual_path = if path.starts_with("/dev/") {
                    match config::volume::resolve_mount_point(path) {
                        Some(mount_point) => mount_point,
                        None => {
                            log::warn("device is not mounted");
                            return;
                        }
                    }
                } else {
                    path.clone()
                };

                if !config::volume::is_dir_empty(&actual_path) {
                    log::warn("cannot initialize volume because is not empty");
                    return;
                }

                if let Err(e) = config::volume::add_volume(&actual_path) {
                    log::warn(&format!("failed to add volume: {}", e));
                }
            }
        },
        Commands::Remove { target } => match target {
            RemoveTarget::Volume { value } => {
                if value.starts_with('/') {
                    if let Err(e) = config::volume::remove_volume_by_path(value) {
                        log::warn(&format!("failed to remove volume by path: {}", e));
                    }
                } else {
                    if let Err(e) = config::volume::remove_volume_by_id(value) {
                        log::warn(&format!("failed to remove volume by id: {}", e));
                    }
                }
            }
        },
        Commands::List { target } => match target {
            ListTarget::Volume => {
                if let Err(e) = config::volume::list_volumes() {
                    log::warn(&format!("failed to list volumes: {}", e));
                }
            }
        },
    }
}
