use axum::{Json};
use axum::extract::{Json as ExtractJson, Path};
use chrono::Local;
use serde::{Serialize, Deserialize};

use crate::web::response::ApiResponse;
use crate::config::volume;
use crate::volume::collection;

// Volume struct for serialization
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

#[derive(Deserialize)]
pub struct VolumeValue {
    value: String,
}

// Collection struct for serialization
#[derive(Deserialize)]
pub struct CollectionInput {
    name: String,
}

#[derive(Serialize)]
pub struct CollectionList {
    collections: Vec<CollectionEntry>,
}

#[derive(Serialize)]
pub struct CollectionEntry {
    id: String,
    name: String,
}

// GET /v1/ipelfs/volumes
pub async fn get_volumes() -> Json<ApiResponse<VolumeList>> {
    let volumes = match volume::load_config() {
        Ok(cfg) => cfg.get_volume_map()
            .iter()
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

// POST /v1/ipelfs/volumes/create
pub async fn post_create_volume(Json(input): ExtractJson<VolumeInput>) -> Json<ApiResponse<String>> {
    match volume::try_create_new_volume(&input.path) {
        Ok(id) => Json(ApiResponse::ok(id, None)),
        Err(msg) => Json(ApiResponse::fail(msg)),
    }
}

// POST /v1/ipelfs/volumes/add
pub async fn post_add_volume(Json(input): ExtractJson<VolumeInput>) -> Json<ApiResponse<String>> {
    match volume::try_add_existing_volume(&input.path) {
        Ok(id) => Json(ApiResponse::ok(id, None)),
        Err(msg) => Json(ApiResponse::fail(msg)),
    }
}

// POST /v1/ipelfs/volumes/remove
pub async fn post_remove_volume(Json(input): ExtractJson<VolumeValue>) -> Json<ApiResponse<String>> {
    let res = if input.value.starts_with('/') {
        volume::remove_volume_by_path(&input.value)
    } else {
        volume::remove_volume_by_id(&input.value)
    };

    match res {
        Ok(_) => Json(ApiResponse::ok(input.value, None)),
        Err(err) => Json(ApiResponse::fail(err.to_string())),
    }
}

// POST /v1/ipelfs/volumes/delete
pub async fn post_delete_volume(Json(input): ExtractJson<VolumeValue>) -> Json<ApiResponse<String>> {
    match volume::delete_ipelfs(&input.value) {
        Ok(_) => Json(ApiResponse::ok(input.value, None)),
        Err(err) => Json(ApiResponse::fail(err.to_string())),
    }
}

// POST /v1/ipelfs/volumes/{id}/collections
pub async fn post_create_collection(
    Path(volume_id): Path<String>,
    Json(input): ExtractJson<CollectionInput>,
) -> Json<ApiResponse<String>> {
    match collection::create_collection(&volume_id, &input.name) {
        Ok(cid) => Json(ApiResponse::ok(cid, None)),
        Err(err) => Json(ApiResponse::fail(err)),
    }
}

// GET /v1/ipelfs/volumes/{id}/collections
pub async fn get_collections(
    Path(volume_id): Path<String>,
) -> Json<ApiResponse<CollectionList>> {
    match collection::list_collections(&volume_id) {
        Ok(map) => {
            let collections = map
                .into_iter()
                .filter_map(|(id, val)| {
                    val.as_str().map(|name| CollectionEntry {
                        id,
                        name: name.to_string(),
                    })
                })
                .collect();
            Json(ApiResponse::ok(CollectionList { collections }, None))
        }
        Err(err) => Json(ApiResponse::fail(err)),
    }
}
