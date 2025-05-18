// main.rs

use axum::{routing::get, Router};
use clap::Parser;
use std::net::SocketAddr;

mod utils;

use utils::cli::{Cli, Commands, WebCommand};
use utils::logger;

async fn handler_root() -> &'static str {
    "Hello from IPELFS Axum server!"
}

async fn start_server(port: u16) {
    let app = Router::new().route("/", get(handler_root));

    let addr_str = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr_str.parse().expect("Invalid address format");

    logger::action(&format!("Starting on http://localhost:{}", port));

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