use std::fs::{self, File};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use std::time::Instant;
use once_cell::sync::Lazy;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::log;

const CONFIG_PATH: &str = "/etc/ipel/fs/config.toml";

#[derive(Debug, Deserialize, Serialize)]
pub struct FullConfig {
    #[serde(flatten)]
    rest: BTreeMap<String, toml::Value>,
    volume: Option<BTreeMap<String, String>>,
}

static EMPTY_VOLUME_MAP: Lazy<BTreeMap<String, String>> = Lazy::new(BTreeMap::new);

impl FullConfig {
    pub fn get_volume_map(&self) -> &BTreeMap<String, String> {
        self.volume.as_ref().unwrap_or(&EMPTY_VOLUME_MAP)
    }
}

// add new volume and return id
pub fn create_volume(path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    if volumes.values().any(|v| v == path) {
        //log::warn("path already exists in volume table");
        return Err("Path already exists in volume table".into());
    }

    let id = loop {
        let id = gen_id();
        if !volumes.contains_key(&id) {
            break id;
        }
    };

    volumes.insert(id.clone(), path.to_string());
    config.volume = Some(volumes);
    save_config(&config)?;

    log::good(&format!("Volume added @{} -> {}", id, path));
    Ok(id)
}

// remove by volume id
pub fn remove_volume_by_id(id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    let path = match volumes.get(id) {
        Some(p) => p.clone(),
        None => {
            return Err(format!("Volume @{} not found", id).into());
        }
    };

    volumes.remove(id);
    config.volume = Some(volumes);
    save_config(&config)?;

    // remove .vlock
    let vlock_path = std::path::Path::new(&path).join(".vlock");
    let _ = std::fs::remove_file(&vlock_path);

    log::info(&format!("Volume removed @{}", id));
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
            Err("no volume found with given path".into())
        }
        1 => {
            let id = &matches[0];
            volumes.remove(id);
            config.volume = Some(volumes);
            save_config(&config)?;

            // remove .vlock
            let vlock_path = std::path::Path::new(target_path).join(".vlock");
            let _ = std::fs::remove_file(&vlock_path);

            log::info(&format!("volume removed @{}", id));
            Ok(())
        }
        _ => {
            Err("multiple volumes match this path".into())
        }
    }
}

// load config file
pub fn load_config() -> Result<FullConfig, Box<dyn std::error::Error>> {
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
        log::info(&format!("@{} -> {}", id, path));
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

pub fn delete_ipelfs(path_or_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let (id, target_path) = if path_or_id.starts_with('/') {
        // resolve by path
        let config = load_config()?;
        let volumes = config.volume.unwrap_or_default();

        let matches: Vec<(String, String)> = volumes.iter()
            .filter(|(_, v)| *v == path_or_id)
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect();

        match matches.len() {
            0 => return Err("no matching volume found for path".into()),
            1 => (matches[0].0.clone(), Path::new(&matches[0].1).to_path_buf()),
            _ => return Err("multiple volumes match this path".into()),
        }
    } else {
        // resolve by id
        let config = load_config()?;
        let volumes = config.volume.unwrap_or_default();
        match volumes.get(path_or_id) {
            Some(p) => (path_or_id.to_string(), Path::new(p).to_path_buf()),
            None => return Err("volume id not found".into()),
        }
    };

    // remove from config
    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();
    volumes.remove(&id);
    config.volume = Some(volumes);
    save_config(&config)?;

    // remove .vlock and .ipelfs
    let _ = std::fs::remove_file(target_path.join(".vlock"));
    let _ = std::fs::remove_file(target_path.join(".ipelfs"));

    log::info(&format!("@{} has been released and ipelfs removed", id));
    log::action("You may now manage or wipe the volume manually");
    Ok(())
}

pub fn add_existing_volume(path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let root = Path::new(path);

    let ipelfs_file = root.join(".ipelfs");
    if !ipelfs_file.exists() {
        return Err("'.ipelfs' not found in volume root".into());
    }

    let id = fs::read_to_string(&ipelfs_file)
        .map_err(|_| "failed to read .ipelfs file")?
        .trim()
        .to_string();

    if id.len() != 7 || !id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit()) {
        return Err("invalid volume ID format in .ipelfs".into());
    }

    if root.join(".vlock").exists() {
        return Err("volume appears locked ('.vlock' exists) — either in use or not cleanly unmounted".into());
    }

    let mut config = load_config()?;
    let mut volumes = config.volume.take().unwrap_or_default();

    if volumes.contains_key(&id) {
        return Err(format!("volume ID '{}' already registered", id).into());
    }

    if volumes.values().any(|v| v == path) {
        return Err("volume path already registered".into());
    }

    volumes.insert(id.clone(), path.to_string());
    config.volume = Some(volumes);
    save_config(&config)?;

    let now = chrono::Local::now().to_rfc3339();
    let _ = File::create(root.join(".vlock"))?.write_all(now.as_bytes());

    //log::good(&format!("existing volume mounted @{} -> {}", id, path));
    Ok(id)
}

pub fn try_add_existing_volume(path: &str) -> Result<String, String> {
    add_existing_volume(path).map_err(|e| e.to_string())
}

pub fn try_create_new_volume(path: &str) -> Result<String, String> {
    create_volume(path).map_err(|e| e.to_string())
}
