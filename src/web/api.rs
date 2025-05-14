use axum::{Json, extract::Json as ExtractJson};
use chrono::Local;
use serde::{Serialize, Deserialize};
//use std::time::Instant;

use crate::web::response::ApiResponse;
use crate::config::volume::{load_config, try_add_existing_volume, try_create_new_volume};

#[derive(Serialize)]
struct Volume {
    id: String,
    path: String,
}

#[derive(Serialize)]
pub struct VolumeList {
    volumes: Vec<Volume>,
}

#[derive(Deserialize)]
pub struct VolumeInput {
    path: String,
}


pub async fn get_volumes() -> Json<ApiResponse<VolumeList>> {
    
    //let start = Instant::now();

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

pub async fn post_add_volume(Json(input): ExtractJson<VolumeInput>) -> Json<ApiResponse<String>> {
    match try_add_existing_volume(&input.path) {
        Ok(id) => Json(ApiResponse::ok(id, None)),
        Err(msg) => Json(ApiResponse::fail(msg)),
    }
}

pub async fn post_create_volume(Json(input): ExtractJson<VolumeInput>) -> Json<ApiResponse<String>> {
    match try_create_new_volume(&input.path) {
        Ok(id) => Json(ApiResponse::ok(id, None)),
        Err(msg) => Json(ApiResponse::fail(msg)),
    }
}
