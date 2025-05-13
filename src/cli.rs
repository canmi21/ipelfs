use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
#[command(name = "ipelfs")]
#[command(about = "IP Embedded Local Filesystem Tool")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    Add {
        #[command(subcommand)]
        target: AddTarget,
    },
    Remove {
        #[command(subcommand)]
        target: RemoveTarget,
    },
}

#[derive(Subcommand, Debug)]
pub enum AddTarget {
    Volume {
        path: String,
    },
}

#[derive(Subcommand, Debug)]
pub enum RemoveTarget {
    Volume {
        value: String, // either id or path
    },
}
