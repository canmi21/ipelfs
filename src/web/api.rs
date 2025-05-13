use axum::Json;
use serde::Serialize;
use std::time::Instant;
use crate::config::volume::load_config;

#[derive(Serialize)]
pub struct Volume {
    pub id: String,
    pub path: String,
}

#[derive(Serialize)]
pub struct VolumeResponse {
    pub meta: Meta,
    pub volumes: Vec<Volume>,
}

#[derive(Serialize)]
pub struct Meta {
    pub count: usize,
    pub elapsed_ms: u128,
}


pub async fn get_volumes() -> Json<VolumeResponse> {
    let start = Instant::now();

    let config = match load_config() {
        Ok(cfg) => cfg,
        Err(_) => {
            return Json(VolumeResponse {
                meta: Meta {
                    count: 0,
                    elapsed_ms: 0,
                },
                volumes: vec![],
            });
        }
    };

    let volumes: Vec<Volume> = config
        .get_volume_map()
        .iter()
        .map(|(id, path)| Volume {
            id: id.clone(),
            path: path.clone(),
        })
        .collect();

    let elapsed = start.elapsed().as_millis();

    Json(VolumeResponse {
        meta: Meta {
            count: volumes.len(),
            elapsed_ms: elapsed,
        },
        volumes,
    })
}
