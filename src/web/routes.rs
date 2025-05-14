use axum::{Router, routing::{get, post}};

use crate::web::api::{
    get_volumes,
    post_create_volume,
    post_add_volume,
    post_remove_volume,
    post_delete_volume,
    get_collections,
    post_create_collection,
    post_delete_collection,
    post_transfer_collection,
};

pub fn build_router() -> Router {
    Router::new()
        .nest("/v1/ipelfs", Router::new()
            .route("/volumes", get(get_volumes))
            .route("/volumes/create", post(post_create_volume))
            .route("/volumes/add", post(post_add_volume))
            .route("/volumes/remove", post(post_remove_volume))
            .route("/volumes/delete", post(post_delete_volume))
            .route("/volumes/:id/collections", get(get_collections))
            .route("/volumes/:id/collections", post(post_create_collection))
            .route("/volumes/:id/collections/create", post(post_create_collection))
            .route("/volumes/:id/collections/delete", post(post_delete_collection))
            .route("/volumes/:from/collections/:id/transfer",post(post_transfer_collection))
        )
}
