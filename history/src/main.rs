use std::fs::File;
use std::io::{self, ErrorKind, Write};
use axum::{
    serve,
    Router, // Explicitly import Router for clarity
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE, HeaderValue}, // For CORS and Cache Headers
        Method,
        Request as HttpRequest, // Using HttpRequest as an alias for axum::http::Request
    },
    middleware::{self, Next}, // Import Next (it's not generic here)
    response::Response as AxumResponse,
    body::Body as AxumBody, // Import Axum's standard Body type
};
use chrono::Local;
use clap::Parser;
use tokio::net::TcpListener;
use tokio::runtime::Runtime;
use tower_http::cors::{CorsLayer};

mod web;
mod log;
mod cli;
mod utils;
mod config;
mod volume;

// CLI related structs
use cli::{Cli, Commands, AddTarget, CreateTarget, DeleteTarget, ListTarget, RemoveTarget};

// Middleware to add no-cache headers to every API response
async fn add_no_cache_headers(
    request: HttpRequest<AxumBody>, // Request now uses the concrete AxumBody type
    next: Next,                     // Next is not generic
) -> AxumResponse {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    // Instruct clients and proxies not to cache the response
    headers.insert(
        axum::http::header::CACHE_CONTROL,
        HeaderValue::from_static("no-store, no-cache, must-revalidate, proxy-revalidate"),
    );
    headers.insert(
        axum::http::header::PRAGMA,
        HeaderValue::from_static("no-cache"), // For older HTTP/1.0 clients
    );
    headers.insert(
        axum::http::header::EXPIRES,
        HeaderValue::from_static("0"), // Or a past date
    );
    response
}

fn main() {
    // Load application configuration
    match config::Config::load() {
        Ok(_) => { /* Config loaded successfully */ }
        Err(e) => {
            if let Some(io_err) = e.downcast_ref::<io::Error>() {
                if io_err.kind() == ErrorKind::PermissionDenied {
                    log::warn(&format!("Failed to load config due to permissions: {}", io_err));
                    log::action("If this is your first time running, try with sudo: sudo ipelfs");
                    return;
                }
            }
            log::warn(&format!("Failed to load config: {}", e));
            log::action("Config file might be corrupted or inaccessible. Manual intervention may be needed.");
            return;
        }
    }

    // Parse command line arguments
    let cli_args = Cli::parse();

    // Handle CLI commands
    match &cli_args.command {
        Commands::Create { target } => match target {
            CreateTarget::Volume { path } => {
                let actual_path = if path.starts_with("/dev/") {
                    match config::volume::resolve_mount_point(path) {
                        Some(mount_point) => mount_point,
                        None => {
                            log::warn("Device is not mounted.");
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
                                log::warn(&format!("Volume already owned by @{}", owner_id.trim()));
                            }
                            Err(_) => {
                                log::warn(".ipelfs file exists, but volume data might be broken.");
                            }
                        }
                    } else {
                        log::warn(&format!("Cannot initialize volume: '{}' is not empty.", actual_path));
                    }
                    return;
                }

                match config::volume::create_volume(&actual_path) {
                    Ok(id) => {
                        if let Err(e) = config::meta::init_volume_meta(&id, &actual_path) {
                            log::warn(&format!("Volume metadata initialization failed: {}", e));
                            return;
                        }
                        let vlock_path = std::path::Path::new(&actual_path).join(".vlock");
                        if let Ok(mut f) = File::create(&vlock_path) {
                            let now = Local::now().to_rfc3339();
                            let _ = f.write_all(now.as_bytes());
                        }
                        // Success log for volume creation is likely handled within create_volume or meta_init
                    }
                    Err(e) => {
                        log::warn(&format!("Failed to create volume: {}", e));
                    }
                }
            }
        },
        Commands::Remove { target } => match target {
            RemoveTarget::Volume { value } => {
                let result = if value.starts_with('/') {
                    config::volume::remove_volume_by_path(value)
                } else {
                    config::volume::remove_volume_by_id(value)
                };
                if let Err(e) = result {
                    log::warn(&format!("Failed to remove volume: {}", e));
                }
                // Success log for volume removal is likely handled within remove_volume functions
            }
        },
        Commands::List { target } => match target {
            ListTarget::Volume => {
                if let Err(e) = config::volume::list_volumes() {
                    log::warn(&format!("Failed to list volumes: {}", e));
                }
            }
        },
        Commands::Delete { target } => match target {
            DeleteTarget::Volume { value } => {
                if let Err(e) = config::volume::delete_ipelfs(value) {
                    log::action(&format!("Failed to delete volume data: {}", e));
                }
                // Success log for volume deletion is likely handled within delete_ipelfs
            }
        },
        Commands::Add { target } => match target {
            AddTarget::Volume { path } => {
                let actual_path = if path.starts_with("/dev/") {
                    match config::volume::resolve_mount_point(path) {
                        Some(mount_point) => mount_point,
                        None => {
                            log::warn("Device is not mounted.");
                            return;
                        }
                    }
                } else {
                    path.clone()
                };

                match config::volume::add_existing_volume(&actual_path) {
                    Ok(id) => {
                        log::good(&format!("Volume mounted successfully as @{}", id));
                    }
                    Err(e) => {
                        log::warn(&format!("Failed to add existing volume: {}", e));
                    }
                }
            }
        },
        Commands::Web => {
            // Create a new Tokio runtime for the web server
            let rt = Runtime::new().unwrap_or_else(|e| {
                log::warn(&format!("Failed to create Tokio runtime: {}", e));
                std::process::exit(1);
            });

            // Block the current thread on the async task
            rt.block_on(async {
                // Define the frontend origin allowed by CORS
                let frontend_origin = "http://localhost:33331"
                    .parse::<HeaderValue>()
                    .expect("Invalid CORS origin URI format");

                // Configure the CORS layer
                let cors_layer = CorsLayer::new()
                    .allow_origin(frontend_origin) // Allow requests from the specified Vue frontend origin
                    .allow_methods(vec![Method::GET, Method::POST, Method::OPTIONS]) // Allow common HTTP methods including OPTIONS for preflight
                    .allow_headers(vec![CONTENT_TYPE, AUTHORIZATION, ACCEPT]) // Allow common request headers
                    .allow_credentials(true); // Set to true if your frontend sends credentials (e.g., cookies)

                // Build the application router from the web::routes module
                let app_router: Router = web::routes::build_router(); // Explicitly type if build_router returns Router

                // Apply middleware: CORS layer first, then the no-cache headers middleware
                let app_with_middleware = app_router
                    .layer(cors_layer)
                    .layer(middleware::from_fn(add_no_cache_headers));
                
                let listener_addr = "127.0.0.1:33330";
                let listener = match TcpListener::bind(listener_addr).await {
                    Ok(l) => l,
                    Err(e) => {
                        log::warn(&format!("Failed to bind to address {}: {}", listener_addr, e));
                        return;
                    }
                };
                log::action(&format!(
                    "Web API server running at http://{} (CORS enabled for http://localhost:33331, no-cache enabled)",
                    listener_addr
                ));

                // Start the Axum server
                // For Axum 0.7+, .into_make_service() is often not needed if app_with_middleware is already a Router.
                // If you encounter type errors here, you might need it or .into_make_service_with_connect_info().
                if let Err(e) = serve(listener, app_with_middleware /*.into_make_service()*/).await {
                    log::warn(&format!("Axum server error: {}", e));
                }
            });
        }
    }
}