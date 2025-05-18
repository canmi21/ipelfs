/* src/main.rs */

use axum::{middleware, Router};
use clap::Parser;
use std::net::SocketAddr;

// Declare all top-level modules
mod config;
mod handlers;
mod routes;
mod services;
mod utils;

// Use necessary items from modules
use utils::cli::{Cli, Commands, WebCommand};
use utils::logger; // Keep logger for server start/stop messages if desired by user
use services::middleware::{create_cors_layer, no_cache_middleware};
use crate::routes::create_app_router; // Import the main router creation function

// handler_root is now moved to routes/api_routes.rs

async fn start_server(port: u16) {
    // Create the Axum application by getting the router from our routes module
    let app_router = create_app_router();

    let app = Router::new() // Create a new top-level router for middleware
        .merge(app_router) // Merge the application specific routes
        // Apply the no-cache middleware to all routes
        .layer(middleware::from_fn(no_cache_middleware))
        // Apply the CORS layer. This should usually be one of the outer layers.
        .layer(create_cors_layer());

    let addr_str = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr_str.parse().expect("Invalid address format");

    // These logs were kept as per original user code.
    logger::info(&format!("IPELFS Web Server starting on http://localhost:{}{}", port, config::CONFIG.base_url));

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    logger::good("Server setup complete. Listening for connections...");

    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

#[tokio::main]
async fn main() {
    // Initialize logger or other global states if necessary
    // utils::logger::info("Application starting..."); // Example, add if needed

    let cli_args = Cli::parse();

    match cli_args.command {
        Commands::Web(WebCommand { port }) => {
            // logger::info("Executing 'web' command..."); // This was in your previous main.rs, respecting its absence now
            start_server(port).await;
        }
    }
}