// src/services/websocket/connection.rs

use axum::extract::ws::{Message, WebSocket};
use crate::utils::logger;

// This function handles the actual socket communication logic
pub async fn handle_socket(mut socket: WebSocket) {
    logger::good("New WebSocket connection established");

    if let Err(e) = socket.send(Message::Text("Hello from IPELFS WebSocket!".to_string())).await {
        logger::warn(&format!("Failed to send welcome message: {}", e));
        return;
    }

    while let Some(msg_result) = socket.recv().await {
        match msg_result {
            Ok(msg) => match msg {
                Message::Text(t) => {
                    logger::info(&format!("Received text message: {}", t));
                    if socket
                        .send(Message::Text(format!("You said: {}", t)))
                        .await
                        .is_err()
                    {
                        logger::info("Client disconnected while echoing text.");
                        break;
                    }
                }
                Message::Binary(b) => {
                    logger::info(&format!("Received binary message: {} bytes", b.len()));
                    if socket.send(Message::Binary(b)).await.is_err() {
                        logger::info("Client disconnected while echoing binary.");
                        break;
                    }
                }
                Message::Ping(p) => {
                    logger::action("Received Ping, sending Pong");
                    if socket.send(Message::Pong(p)).await.is_err() {
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
            },
            Err(e) => {
                logger::warn(&format!("Error receiving message: {}", e));
                break;
            }
        }
    }

    logger::info("WebSocket connection closed");
}
