/* src/handlers/websocket.rs */

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};
use crate::utils::logger;

// This function handles WebSocket upgrade requests.
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    // State can be used to share application state, e.g., AppConfig or a chat room manager
    // State(state): State<Arc<AppState>>, // Example if you have shared state
) -> impl IntoResponse {
    logger::action("WebSocket upgrade requested");
    ws.on_upgrade(handle_socket)
}

// This function is called after a successful WebSocket upgrade.
// It defines how individual WebSocket connections are managed.
async fn handle_socket(mut socket: WebSocket) {
    logger::good("New WebSocket connection established");

    // Send a welcome message
    if let Err(e) = socket.send(Message::Text("Hello from IPELFS WebSocket!".to_string())).await {
        logger::warn(&format!("Failed to send welcome message: {}", e));
        return;
    }

    // Loop to process messages from the client
    while let Some(msg_result) = socket.recv().await { // Uses StreamExt
        match msg_result {
            Ok(msg) => {
                match msg {
                    Message::Text(t) => {
                        logger::info(&format!("Received text message: {}", t));
                        // Echo the message back to the client
                        if socket
                            .send(Message::Text(format!("You said: {}", t))) // Uses SinkExt
                            .await
                            .is_err()
                        {
                            logger::info("Client disconnected while echoing text.");
                            break;
                        }
                    }
                    Message::Binary(b) => {
                        logger::info(&format!("Received binary message: {} bytes", b.len()));
                        if socket.send(Message::Binary(b)).await.is_err() { // Uses SinkExt
                            logger::info("Client disconnected while echoing binary.");
                            break;
                        }
                    }
                    Message::Ping(p) => {
                        logger::action("Received Ping, sending Pong");
                        if socket.send(Message::Pong(p)).await.is_err() { // Uses SinkExt
                            logger::info("Client disconnected while sending Pong.");
                            break;
                        }
                    }
                    Message::Pong(p) => {
                        logger::action(&format!("Received Pong: {:?}", p));
                    }
                    Message::Close(c) => {
                        if let Some(cf) = c {
                            logger::info(&format!(
                                "Received close message with code {} and reason '{}'",
                                cf.code, cf.reason
                            ));
                        } else {
                            logger::info("Received close message (no details)");
                        }
                        break;
                    }
                }
            }
            Err(e) => {
                logger::warn(&format!("Error receiving message: {}", e));
                break;
            }
        }
    }
    logger::info("WebSocket connection closed");
}