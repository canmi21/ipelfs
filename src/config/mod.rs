use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

use crate::log;

const CONFIG_PATH: &str = "/etc/ipel/fs/config.toml";

#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub log_level: Option<String>,
    pub data_dir: Option<String>,
}

impl Config {
    pub fn load() -> Result<Config, Box<dyn std::error::Error>> {
        if !Path::new(CONFIG_PATH).exists() {
            let default = Config {
                log_level: Some("info".to_string()),
                data_dir: Some("/var/lib/ipel/fs".to_string()),
            };
            let toml_string = toml::to_string(&default)?;
            fs::create_dir_all("/etc/ipel/fs")?;
            fs::write(CONFIG_PATH, toml_string)?;
            log::good(&format!("config created at -> {}", CONFIG_PATH));
            Ok(default)
        } else {
            let content = fs::read_to_string(CONFIG_PATH)?;
            let config: Config = toml::from_str(&content)?;
            //log::info("config.toml loaded");
            Ok(config)
        }
    }
}
