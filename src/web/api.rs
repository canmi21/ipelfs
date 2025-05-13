use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct Volume {
    id: String,
    path: String,
}

pub async fn get_volumes() -> Json<Vec<Volume>> {
    Json(vec![
        Volume { id: "abcde".into(), path: "/mnt/data1".into() },
        Volume { id: "fghij".into(), path: "/mnt/data2".into() },
    ])
}
