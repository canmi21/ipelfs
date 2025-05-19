/* src/main.rs */

use axum::{middleware, Router};
use clap::Parser;
use std::net::SocketAddr;

mod config;
mod handlers;
mod routes;
mod services;
mod utils;

use utils::cli::{Cli, Commands, WebCommand};
use utils::logger;
use services::middleware::{create_cors_layer, no_cache_middleware};
use crate::routes::create_app_router;
use get_if_addrs::get_if_addrs;

async fn start_server(port: u16) {
    let app_router = create_app_router();

    let app = Router::new()
        .merge(app_router)
        .layer(middleware::from_fn(no_cache_middleware))
        .layer(create_cors_layer());

    let addr_str = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr_str.parse().expect("Invalid address format");

    logger::action("Server setup complete. Listening for connections...");

    logger::good(&format!("Local:   http://localhost:{}", port));

    if let Ok(addrs) = get_if_addrs() {
        for iface in addrs {
            let ip = iface.ip();
            if ip.is_ipv4() && !ip.is_loopback() {
                logger::good(&format!("Network: http://{}:{}", ip, port));
            }
        }
    }

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

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
