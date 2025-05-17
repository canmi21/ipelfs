use std::fs;
use axum::{
    extract::Path,
    response::IntoResponse,
    Json,
};
use toml;

use crate::config::volume as config_volume_utils;
use crate::web::response::ApiResponse;

fn read_volume_meta_toml(volume_id: &str) -> Result<toml::Value, String> {
    let volume_root_path = config_volume_utils::get_volume_root(volume_id)
        .ok_or_else(|| format!("Volume with ID '{}' not found in configuration.", volume_id))?;

    let meta_toml_file_path = volume_root_path.join("meta.toml");

    if !meta_toml_file_path.exists() {
        return Err(format!(
            "meta.toml does not exist for volume '{}' at path: {:?}",
            volume_id, meta_toml_file_path
        ));
    }

    let content = fs::read_to_string(&meta_toml_file_path).map_err(|e| {
        format!(
            "Failed to read meta.toml for volume '{}': {}",
            volume_id, e
        )
    })?;

    let parsed_toml_data: toml::Value = toml::from_str(&content).map_err(|e| {
        format!(
            "Failed to parse meta.toml for volume '{}': {}",
            volume_id, e
        )
    })?;

    Ok(parsed_toml_data)
}

// GET /volumes/:id/info
pub async fn get_volume_info_handler(Path(volume_id): Path<String>) -> impl IntoResponse {
    match read_volume_meta_toml(&volume_id) {
        Ok(meta_data) => {
            Json(ApiResponse::ok(meta_data, None))
        }
        Err(err_msg) => {
            Json(ApiResponse::fail(err_msg))
        }
    }
}