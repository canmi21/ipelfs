use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::log;

const CONFIG_PATH: &str = "/etc/ipel/fs/config.toml";

#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub ipelfs: IpelFs,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct IpelFs {
    pub os: String,
    pub arch: String,
    pub ram: String,
    pub fs_type: String,
    pub version: String,
    pub timestamp: String,
}

impl Config {
    // load config, create if not exists
    pub fn load() -> Result<Config, Box<dyn std::error::Error>> {
        if !Path::new(CONFIG_PATH).exists() {
            let default = Config {
                ipelfs: IpelFs {
                    os: std::env::consts::OS.to_string(),
                    arch: std::env::consts::ARCH.to_string(),
                    ram: get_ram(),
                    fs_type: get_fs_type(),
                    version: env!("CARGO_PKG_VERSION").to_string(),
                    timestamp: chrono::Local::now().to_rfc3339(),
                },
            };
            let toml_string = toml::to_string(&default)?;
            fs::create_dir_all("/etc/ipel/fs")?;
            fs::write(CONFIG_PATH, toml_string)?;
            log::good(&format!("config created at -> {}", CONFIG_PATH));
            Ok(default)
        } else {
            let content = fs::read_to_string(CONFIG_PATH)?;
            let config: Config = toml::from_str(&content)?;
            Ok(config)
        }
    }
}

// return total memory in MB
fn get_ram() -> String {
    match sys_info::mem_info() {
        Ok(mem) => format!("{} MB", mem.total / 1024),
        Err(_) => "unknown".to_string(),
    }
}

// return filesystem type of /
fn get_fs_type() -> String {
    if let Ok(content) = fs::read_to_string("/proc/mounts") {
        for line in content.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 && parts[1] == "/" {
                return parts[2].to_string();
            }
        }
    }
    "unknown".to_string()
}
