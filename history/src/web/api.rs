use axum::{Json};
use axum::extract::{Json as ExtractJson, Path};
use chrono::{Local, DateTime};
use serde::{Serialize, Deserialize};

use crate::log;
use crate::web::response::ApiResponse;
use crate::config::volume;
use crate::volume::{collection, metadata};

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

#[derive(Deserialize)]
pub struct DeleteCollectionInput {
    value: String, // name or id
    by: String,     // "name" or "id"
}

// Collection transfer input
#[derive(Deserialize)]
pub struct CollectionTransferInput {
    to: String,
}

// GET /v1/ipelfs/healthcheck
pub async fn get_healthcheck() -> Json<ApiResponse<String>> {
    let now: DateTime<Local> = Local::now();
    let timestamp = now.to_rfc3339();
    Json(ApiResponse::ok(timestamp, None))
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
        Ok(cid) => {
            log::good(&format!("collection created @{}:{} -> {}", volume_id, cid, input.name));

            if let Some(root) = volume::get_volume_root(&volume_id) {
                let entry = format!("@v:{}/c:{}", volume_id, cid);
                let _ = metadata::create(&root, &entry);
            }

            Json(ApiResponse::ok(cid, None))
        }
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

// POST /v1/ipelfs/volumes/{id}/collections/delete
pub async fn post_delete_collection(
    Path(volume_id): Path<String>,
    Json(input): ExtractJson<DeleteCollectionInput>,
) -> Json<ApiResponse<String>> {
    let result = match input.by.as_str() {
        "id" => collection::delete_collection_by_id(&volume_id, &input.value),
        "name" => collection::delete_collection_by_name(&volume_id, &input.value),
        _ => Err("invalid 'by' value, must be 'id' or 'name'".into()),
    };

    match result {
        Ok(()) => {
            if let Some(root) = volume::get_volume_root(&volume_id) {
                let entry = format!("@v:{}/c:{}", volume_id, input.value);
                let _ = metadata::delete(&root, &entry);
            }

            log::info(&format!("collection deleted @{}:{}", volume_id, input.value));
            Json(ApiResponse::ok(input.value.clone(), None))
        }
        Err(err) => Json(ApiResponse::fail(err)),
    }
}

// POST /v1/ipelfs/volumes/{id}/collections/{id}/transfer
pub async fn post_transfer_collection(
    Path((from_volume, collection_id)): Path<(String, String)>,
    Json(input): ExtractJson<CollectionTransferInput>,
) -> Json<ApiResponse<String>> {
    let is_valid_id = collection_id.len() == 7
        && collection_id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit());

    if !is_valid_id {
    return Json(ApiResponse::<String>::fail("invalid collection id"));
    }

    match collection::transfer_collection(&from_volume, &collection_id, &input.to) {
        Ok(_) => {
            log::info(&format!("collection transferred @{}:{} -> {}", from_volume, collection_id, input.to));
            if let Some(from_root) = volume::get_volume_root(&from_volume) {
                let entry = format!("@v:{}/c:{}", from_volume, collection_id);
                let _ = metadata::transfer(&from_root, &entry, &input.to);
            }
            if let Some(to_root) = volume::get_volume_root(&input.to) {
                let entry = format!("@v:{}/c:{}", from_volume, collection_id);
                let _ = metadata::receive(&to_root, &entry, &input.to);
            }

            Json(ApiResponse::ok(collection_id, None))
        }
        Err(err) => Json(ApiResponse::fail(err)),
    }
}