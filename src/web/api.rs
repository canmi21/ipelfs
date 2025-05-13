use axum::Json;
use chrono::Local;
use serde::Serialize;
use std::time::Instant;

use crate::web::response::ApiResponse;
use crate::config::volume::load_config;

#[derive(Serialize)]
struct Volume {
    id: String,
    path: String,
}

#[derive(Serialize)]
pub struct VolumeList {
    volumes: Vec<Volume>,
}

pub async fn get_volumes() -> Json<ApiResponse<VolumeList>> {
    let _start = Instant::now();// Reserve for future use

    let volumes = match load_config() {
        Ok(cfg) => cfg.get_volume_map()
            .into_iter()
            .map(|(id, path)| Volume {
                id: id.to_string(),
                path: path.to_string(),
            })
            .collect(),
        Err(_) => vec![],
    };

    let meta = serde_json::json!({
        "count": volumes.len(),
        "timestamp": Local::now().to_rfc3339()
    });

    Json(ApiResponse::ok(VolumeList { volumes }, Some(meta)))
}
