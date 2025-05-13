use std::fs;
use std::collections::BTreeMap;
use serde::{Deserialize, Serialize};
use rand::{distributions::Alphanumeric};
use crate::log;

const CONFIG_PATH: &str = "/etc/ipel/fs/config.toml";

#[derive(Debug, Deserialize, Serialize)]
struct FullConfig {
    #[serde(flatten)]
    rest: BTreeMap<String, toml::Value>,
    volume: Option<BTreeMap<String, String>>,
}

// add new volume entry with random id -> path
pub fn add_volume(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    // prevent duplicate path
    if volumes.values().any(|v| v == path) {
        log::warn("path already exists in volume table");
        return Err("duplicate path".into());
    }

    let id = gen_id(&volumes);
    volumes.insert(id.clone(), path.to_string());

    config.volume = Some(volumes);
    save_config(&config)?;

    log::good(&format!("volume added: {} -> {}", id, path));
    Ok(())
}

// remove by volume id
pub fn remove_volume_by_id(id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    if volumes.remove(id).is_none() {
        log::warn(&format!("volume id not found: {}", id));
        return Err("volume id not found".into());
    }

    config.volume = Some(volumes);
    save_config(&config)?;

    log::info(&format!("volume removed: {}", id));
    Ok(())
}

// remove by volume path, must match exactly one
pub fn remove_volume_by_path(target_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    let matches: Vec<String> = volumes
        .iter()
        .filter(|(_, v)| *v == target_path)
        .map(|(k, _)| k.clone())
        .collect();

    match matches.len() {
        0 => {
            log::warn("no volume found with given path");
            Err("no match".into())
        }
        1 => {
            let id = &matches[0];
            volumes.remove(id);
            config.volume = Some(volumes);
            save_config(&config)?;
            log::info(&format!("volume removed: {}", id));
            Ok(())
        }
        _ => {
            log::warn("multiple volumes match this path");
            Err("ambiguous match".into())
        }
    }
}

// load config file and parse into struct
fn load_config() -> Result<FullConfig, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(CONFIG_PATH)?;
    let config: FullConfig = toml::from_str(&content)?;
    Ok(config)
}

// write config struct back to file
fn save_config(cfg: &FullConfig) -> Result<(), Box<dyn std::error::Error>> {
    let content = toml::to_string(cfg)?;
    fs::write(CONFIG_PATH, content)?;
    Ok(())
}

// generate unique 5-char id (start with letter, avoid conflict)
fn gen_id(existing: &BTreeMap<String, String>) -> String {
    use rand::distributions::DistString;

    loop {
        let raw = Alphanumeric.sample_string(&mut rand::thread_rng(), 8)
            .to_lowercase()
            .chars()
            .filter(|c| c.is_ascii_lowercase() || c.is_ascii_digit())
            .take(5)
            .collect::<String>();

        if raw.chars().next().map(|c| c.is_ascii_lowercase()).unwrap_or(false)
            && !existing.contains_key(&raw)
        {
            return raw;
        }
    }
}
