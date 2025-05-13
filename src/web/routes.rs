use axum::{Router, routing::get};

use crate::web::api::get_volumes;

pub fn build_router() -> Router {
    Router::new()
        .nest("/v1/ipelfs", Router::new().route("/volumes", get(get_volumes)))
}
