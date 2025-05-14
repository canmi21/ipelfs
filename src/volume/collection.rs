use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;
use toml::{map::Map, Value};

use crate::config::volume::{load_config, gen_id};

// Entry point for creating a collection
pub fn create_collection(volume_id: &str, name: &str) -> Result<String, String> {
    if !is_valid_name(name) {
        return Err("invalid collection name".into());
    }

    let path = get_volume_root(volume_id)?;
    let mut table = load_or_init_index(&path)?;
    let coll_map = get_or_init_collection_table(&mut table)?;

    if name_exists(coll_map, name) {
        return Err("collection name already exists".into());
    }

    let coll_id = generate_unique_id(coll_map);
    coll_map.insert(coll_id.clone(), Value::String(name.to_string()));

    save_index(&path, table)?;
    create_collection_folder(&path, &coll_id)?;

    Ok(coll_id)
}

// Validate collection name
fn is_valid_name(name: &str) -> bool {
    name.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_')
}

// Get volume root path from volume ID
fn get_volume_root(volume_id: &str) -> Result<std::path::PathBuf, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    config
        .get_volume_map()
        .get(volume_id)
        .map(|p| Path::new(p).to_path_buf())
        .ok_or("volume id not found".into())
}

// Load or create index.toml
fn load_or_init_index(root: &Path) -> Result<Map<String, Value>, String> {
    let index_path = root.join("index.toml");
    if index_path.exists() {
        let mut content = String::new();
        File::open(&index_path)
            .and_then(|mut f| f.read_to_string(&mut content))
            .map_err(|e| format!("failed to read index.toml: {}", e))?;
        content.parse::<Value>()
            .map_err(|e| format!("invalid toml: {}", e))?
            .as_table()
            .cloned()
            .ok_or("index.toml must be a table".into())
    } else {
        Ok(Map::new())
    }
}

// Get or init [collection] table
fn get_or_init_collection_table(table: &mut Map<String, Value>) -> Result<&mut Map<String, Value>, String> {
    table
        .entry("collection".to_string())
        .or_insert_with(|| Value::Table(Map::new()))
        .as_table_mut()
        .ok_or("collection section format invalid".into())
}

// Check for duplicate collection name
fn name_exists(map: &Map<String, Value>, name: &str) -> bool {
    map.values().any(|v| v.as_str() == Some(name))
}

// Generate unused collection ID
fn generate_unique_id(existing: &Map<String, Value>) -> String {
    loop {
        let id = gen_id();
        if !existing.contains_key(&id) {
            return id;
        }
    }
}

// Save index.toml
fn save_index(root: &Path, table: Map<String, Value>) -> Result<(), String> {
    let path = root.join("index.toml");
    let mut file = File::create(&path).map_err(|e| format!("write error: {}", e))?;
    let content = toml::to_string(&Value::Table(table)).unwrap();
    file.write_all(content.as_bytes())
        .map_err(|e| format!("failed to write toml: {}", e))
}

// Create physical folder
fn create_collection_folder(root: &Path, id: &str) -> Result<(), String> {
    fs::create_dir_all(root.join(id)).map_err(|e| format!("mkdir failed: {}", e))
}

pub fn list_collections(volume_id: &str) -> Result<Map<String, Value>, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    let path = config
        .get_volume_map()
        .get(volume_id)
        .ok_or("volume id not found")?;
    let index_path = Path::new(path).join("index.toml");

    if !index_path.exists() {
        return Ok(Map::new());
    }

    let mut content = String::new();
    File::open(&index_path)
        .and_then(|mut f| f.read_to_string(&mut content))
        .map_err(|e| format!("read error: {}", e))?;

    let data: Value = content.parse().map_err(|e| format!("toml error: {}", e))?;
    let table = data
        .get("collection")
        .and_then(|v| v.as_table())
        .cloned()
        .unwrap_or_default();

    Ok(table)
}

pub fn delete_collection_by_id(volume_id: &str, collection_id: &str) -> Result<(), String> {
    let root = get_volume_root(volume_id)?;
    let mut table = load_or_init_index(&root)?;
    let coll_map = get_or_init_collection_table(&mut table)?;

    if !coll_map.contains_key(collection_id) {
        return Err("collection id not found".into());
    }

    let coll_path = root.join(collection_id);
    if coll_path.exists() {
        fs::remove_dir_all(&coll_path)
            .map_err(|e| format!("failed to remove collection folder: {}", e))?;
    }

    coll_map.remove(collection_id);
    save_index(&root, table)?;

    Ok(())
}

pub fn delete_collection_by_name(volume_id: &str, name: &str) -> Result<(), String> {
    let root = get_volume_root(volume_id)?;
    let mut table = load_or_init_index(&root)?;
    let coll_map = get_or_init_collection_table(&mut table)?;

    let collection_id = coll_map
        .iter()
        .find(|(_, v)| v.as_str() == Some(name))
        .map(|(id, _)| id.clone())
        .ok_or("collection name not found")?;

    let coll_path = root.join(&collection_id);
    if coll_path.exists() {
        fs::remove_dir_all(&coll_path)
            .map_err(|e| format!("failed to remove collection folder: {}", e))?;
    }

    coll_map.remove(&collection_id);
    save_index(&root, table)?;

    Ok(())
}
