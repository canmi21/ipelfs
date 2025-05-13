use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
#[command(name = "ipelfs")]
#[command(about = "IP Embedded Local Filesystem")]
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
    List {
        #[command(subcommand)]
        target: ListTarget,
    },
    Delete {
        #[command(subcommand)]
        target: DeleteTarget,
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
        value: String,
    },
}

#[derive(Subcommand, Debug)]
pub enum ListTarget {
    Volume,
}

#[derive(Subcommand, Debug)]
pub enum DeleteTarget {
    Volume {
        value: String,
    },
}
