use std::fs;
use std::path::Path;
use chrono::Timelike;
use serde::{Deserialize, Serialize};

const CONFIG_PATH: &str = "/etc/ipel/fs/config.toml";

#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub log_level: Option<String>,
    pub data_dir: Option<String>,
}

// format current time as HH:MM:SS
fn now() -> String {
    let time = chrono::Local::now();
    format!("{:02}:{:02}:{:02}", time.hour(), time.minute(), time.second())
}

// log with prefix and timestamp
fn log(prefix: &str, msg: &str) {
    println!("{} {} {}", now(), prefix, msg);
}

impl Config {
    // load config, create if not exists
    pub fn load() -> Result<Config, Box<dyn std::error::Error>> {
        if !Path::new(CONFIG_PATH).exists() {
            let default = Config {
                log_level: Some("info".to_string()),
                data_dir: Some("/var/lib/ipel/fs".to_string()),
            };
            let toml_string = toml::to_string(&default)?;
            fs::create_dir_all("/etc/ipel/fs")?;
            fs::write(CONFIG_PATH, toml_string)?;
            log("+", "config.toml created successfully");
            Ok(default)
        } else {
            let content = fs::read_to_string(CONFIG_PATH)?;
            let config: Config = toml::from_str(&content)?;
            log("#", "config.toml loaded");
            Ok(config)
        }
    }
}
