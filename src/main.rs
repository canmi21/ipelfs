use std::io;
use axum::serve;
use clap::Parser;
use std::fs::File;
use chrono::Local;
use std::io::Write;
use std::io::ErrorKind;
use tokio::net::TcpListener;
use tokio::runtime::Runtime;
use cli::{Cli, Commands, CreateTarget, RemoveTarget, ListTarget, DeleteTarget, AddTarget};

mod web;
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
            log::action("config file may have been worn out and needs to be handled manually");
            return;
        }
    }

    let cli = Cli::parse();

    match &cli.command {
        Commands::Create { target } => match target {
            CreateTarget::Volume { path } => {
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
                    let ipelfs_path = std::path::Path::new(&actual_path).join(".ipelfs");

                    if ipelfs_path.exists() {
                        match std::fs::read_to_string(&ipelfs_path) {
                            Ok(owner_id) => {
                                log::warn(&format!("volume already owned by @{}", owner_id.trim()));
                            }
                            Err(_) => {
                                log::warn("ipelfs exists, volume was broken");
                            }
                        }
                    } else {
                        log::warn(&format!("cannot initialize volume: '{}' is not empty", actual_path));
                    }

                    return;
                }

                match config::volume::create_volume(&actual_path) {
                    Ok(id) => {
                        if let Err(e) = config::meta::init_volume_meta(&id, &actual_path) {
                            log::warn(&format!("meta init failed: {}", e));
                            return;
                        }

                        // write .vlock with timestamp
                        let vlock_path = std::path::Path::new(&actual_path).join(".vlock");
                        if let Ok(mut f) = File::create(&vlock_path) {
                            let now = Local::now().to_rfc3339();
                            let _ = f.write_all(now.as_bytes());
                        }
                    }
                    Err(e) => {
                        log::warn(&format!("{}", e));
                    }
                }
            }
        },
        Commands::Remove { target } => match target {
            RemoveTarget::Volume { value } => {
                if value.starts_with('/') {
                    if let Err(e) = config::volume::remove_volume_by_path(value) {
                        log::warn(&format!("{}", e));
                    }
                } else {
                    if let Err(e) = config::volume::remove_volume_by_id(value) {
                        log::warn(&format!("{}", e));
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
        Commands::Delete { target } => match target {
            DeleteTarget::Volume { value } => {
                match config::volume::delete_ipelfs(value) {
                    Ok(_) => {}
                    Err(e) => {
                        log::action(&format!("failed to delete volume: {}", e));
                    }
                }
            }
        },
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

                match config::volume::add_existing_volume(&actual_path) {
                    Ok(id) => {
                        log::good(&format!("volume mounted as @{}", id));
                    }
                    Err(e) => {
                        log::warn(&format!("failed to add volume: {}", e));
                    }
                }
            }
        },
        Commands::Web => {
            let rt = Runtime::new().unwrap();
            rt.block_on(async {
                let app = web::routes::build_router();

                let listener = TcpListener::bind("127.0.0.1:33330").await.unwrap();
                log::action("webapi running at http://localhost:33330");

                if let Err(e) = serve(listener, app).await {
                    log::warn(&format!("axum error: {}", e));
                }
            });
        }
    }
}
