// src/handlers/websocket.rs

use axum::{
    extract::ws::{WebSocketUpgrade},
    response::IntoResponse,
};
use crate::{services::websocket::connection::handle_socket, utils::logger};

// Handles WebSocket HTTP upgrade
pub async fn websocket_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    logger::action("WebSocket upgrade requested");
    ws.on_upgrade(handle_socket)
}
