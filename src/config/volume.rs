use std::fs;
use rand::Rng;
use std::fs::File;
use std::time::Instant;
use std::collections::BTreeMap;
use std::io::{BufReader, BufRead};
use serde::{Deserialize, Serialize};

use crate::log;

const CONFIG_PATH: &str = "/etc/ipel/fs/config.toml";

#[derive(Debug, Deserialize, Serialize)]
struct FullConfig {
    #[serde(flatten)]
    rest: BTreeMap<String, toml::Value>,
    volume: Option<BTreeMap<String, String>>,
}

// add new volume with generated id -> path
pub fn add_volume(path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    if volumes.values().any(|v| v == path) {
        log::warn("path already exists in volume table");
        return Err("duplicate path".into());
    }

    // ensure id is unique
    let id = loop {
        let id = gen_id();
        if !volumes.contains_key(&id) {
            break id;
        }
    };

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

// load config file
fn load_config() -> Result<FullConfig, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(CONFIG_PATH)?;
    let config: FullConfig = toml::from_str(&content)?;
    Ok(config)
}

// write config to file
fn save_config(cfg: &FullConfig) -> Result<(), Box<dyn std::error::Error>> {
    let content = toml::to_string(cfg)?;
    fs::write(CONFIG_PATH, content)?;
    Ok(())
}

// generate 7-char id (first is letter, rest biased 70% digit)
fn gen_id() -> String {
    const ID_LENGTH: usize = 7;
    const DIGIT_WEIGHT: f64 = 0.7;

    let mut rng = rand::thread_rng();
    let mut id = String::new();

    id.push((b'a' + rng.gen_range(0..26)) as char);

    for _ in 0..(ID_LENGTH - 1) {
        // avoid .gen::<f32>() -> use range instead
        if rng.gen_range(0.0..1.0) < DIGIT_WEIGHT {
            id.push((b'0' + rng.gen_range(0..10)) as char);
        } else {
            id.push((b'a' + rng.gen_range(0..26)) as char);
        }
    }

    id
}

// list all volumes
pub fn list_volumes() -> Result<(), Box<dyn std::error::Error>> {
    let start = Instant::now();

    let config = load_config()?;
    let volumes = config.volume.unwrap_or_default();

    let count = volumes.len();
    let elapsed = start.elapsed().as_millis();

    log::good(&format!("{} volume(s) found in {} ms", count, elapsed));

    for (id, path) in volumes {
        log::info(&format!("{} -> {}", id, path));
    }

    Ok(())
}

// check if device is mounted and return Some(mount_point) or None
pub fn resolve_mount_point(dev_path: &str) -> Option<String> {
    if let Ok(file) = File::open("/proc/mounts") {
        let reader = BufReader::new(file);
        for line in reader.lines().flatten() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[0] == dev_path {
                return Some(parts[1].to_string());
            }
        }
    }
    None
}

// check if dir is empty
pub fn is_dir_empty(path: &str) -> bool {
    match fs::read_dir(path) {
        Ok(mut entries) => entries.next().is_none(),
        Err(_) => false,
    }
}