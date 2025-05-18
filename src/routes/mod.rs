/* src/routes/mod.rs */

use axum::Router;
use crate::config;

mod api;

pub fn create_app_router() -> Router {
    Router::new().nest(
        &config::CONFIG.base_url,
        api::create_api_router(),
    )
}