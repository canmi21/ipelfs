/* src/routes/api.rs */

use axum::{
    routing::get,
    Router,
};
// Assuming the websocket_handler function is still named this way inside the websocket module
use crate::handlers::websocket::websocket_handler;

// Handler for the root path of this specific router.
async fn root_path_handler() -> &'static str {
    "Welcome to IPELFS API!"
}

// Creates a router for API endpoints, including WebSocket.
// This function name is assumed to be the same as before. If you changed it, update here
// and in src/routes/mod.rs where it's called.
pub fn create_api_router() -> Router {
    Router::new()
        .route("/", get(root_path_handler))
        .route("/socket", get(websocket_handler))
}