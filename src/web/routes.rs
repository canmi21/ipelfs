use axum::{Router, routing::get};
use tower_http::services::ServeDir;

use crate::web::api::get_volumes;

pub fn build_router() -> Router {
    Router::new()
        .route("/api/volumes", get(get_volumes))
        .nest_service("/", ServeDir::new("static")) // 前端页面
}
