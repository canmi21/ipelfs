// utils/cli.rs

use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
#[command(name = "ipelfs", author = "canmi", version = "0.1.0", about = "IPELFS command line interface", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    Web(WebCommand),
}

#[derive(Parser, Debug)]
pub struct WebCommand {
    #[arg(short, long, default_value_t = 33330)]
    pub port: u16,
}
