use axum::{Router, routing::{get, post}};
use crate::web::api::{get_volumes, post_add_volume, post_create_volume};

pub fn build_router() -> Router {
    Router::new()
        .nest(
            "/v1/ipelfs",
            Router::new()
                .route("/volumes", get(get_volumes))
                .route("/volumes/add", post(post_add_volume))
                .route("/volumes/create", post(post_create_volume))
        )
}
