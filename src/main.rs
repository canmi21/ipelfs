/* src/main.rs */

use axum::{middleware, routing::get, Router}; // Added middleware
use clap::Parser;
use std::net::SocketAddr;

mod services;
mod utils;

use utils::cli::{Cli, Commands, WebCommand};
use utils::logger;
use services::middleware::{create_cors_layer, no_cache_middleware};

async fn handler_root() -> &'static str {
    "Hello from IPELFS Axum server!"
}

async fn start_server(port: u16) {
    // Create the Axum application with routes
    let app = Router::new()
        .route("/", get(handler_root))
        // Apply the no-cache middleware to all routes defined above it
        .layer(middleware::from_fn(no_cache_middleware))
        // Apply the CORS layer. This should usually be one of the outer layers.
        .layer(create_cors_layer());

    let addr_str = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr_str.parse().expect("Invalid address format");

    logger::info(&format!("Starting on http://localhost:{}", port));

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    logger::good("Server setup complete. Listening for connections...");

    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

#[tokio::main]
async fn main() {
    let cli_args = Cli::parse();

    match cli_args.command {
        Commands::Web(WebCommand { port }) => {
            start_server(port).await;
        }
    }
}