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
    Create {
        #[command(subcommand)]
        target: CreateTarget,
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
    //webapi
    Web,
}

#[derive(Subcommand, Debug)]
pub enum CreateTarget {
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
