// src/services/websocket/connection.rs

use axum::extract::ws::{Message, WebSocket};
use crate::utils::{id::generate_unique_id, logger};

pub async fn handle_socket(mut socket: WebSocket) {
    // Attempt to generate a unique client ID.
    // If generation fails (which is unlikely with a simple vector unless it's pre-filled and all IDs are taken),
    // it defaults to "unknown".
    let existing_ids = vec![]; // This should ideally be a shared, persistent list of active client IDs.
    let client_id = generate_unique_id(9, &existing_ids).unwrap_or_else(|| "unknown_client".to_string());

    // Log the new connection with the client ID embedded in the message.
    // The identity passed to the logger is now just "client".
    logger::good("client", &format!("[{}] New WebSocket connection established", client_id));

    // Try to send a welcome message to the client with their ID.
    if let Err(e) = socket.send(Message::Text(format!("Your client ID: {}", client_id))).await {
        // Log a warning if sending the welcome message fails.
        logger::warn("client", &format!("[{}] Failed to send welcome message: {}", client_id, e));
        return; // Exit if we can't even send the initial message.
    }

    // Loop to continuously receive messages from the WebSocket connection.
    while let Some(msg_result) = socket.recv().await {
        match msg_result {
            Ok(msg) => {
                // Handle different types of WebSocket messages.
                match msg {
                    Message::Text(t) => {
                        // Log received text message.
                        logger::info("client", &format!("[{}] Received text message: {}", client_id, t));
                        // Attempt to echo the text message back to the client.
                        if socket
                            .send(Message::Text(format!("You said: {}", t)))
                            .await
                            .is_err()
                        {
                            // Log if client disconnected during echo and break the loop.
                            logger::info("client", &format!("[{}] Client disconnected while echoing text.", client_id));
                            break;
                        }
                    }
                    Message::Binary(b) => {
                        // Log received binary message.
                        logger::info("client", &format!("[{}] Received binary message: {} bytes", client_id, b.len()));
                        // Attempt to echo the binary message back to the client.
                        if socket.send(Message::Binary(b)).await.is_err() {
                            // Log if client disconnected during echo and break the loop.
                            logger::info("client", &format!("[{}] Client disconnected while echoing binary.", client_id));
                            break;
                        }
                    }
                    Message::Ping(p) => {
                        // Log received Ping and send Pong.
                        logger::action("client", &format!("[{}] Received Ping, sending Pong", client_id));
                        if socket.send(Message::Pong(p)).await.is_err() {
                            // Log if client disconnected while sending Pong and break the loop.
                            logger::info("client", &format!("[{}] Client disconnected while sending Pong.", client_id));
                            break;
                        }
                    }
                    Message::Pong(p) => {
                        // Log received Pong.
                        logger::action("client", &format!("[{}] Received Pong: {:?}", client_id, p));
                    }
                    Message::Close(c) => {
                        // Log that a close message was received.
                        if let Some(cf) = c {
                            logger::info("client", &format!(
                                "[{}] Received close message with code {} and reason '{}'",
                                client_id, cf.code, cf.reason
                            ));
                        } else {
                            logger::info("client", &format!("[{}] Received close message (no details)", client_id));
                        }
                        break; // Exit the loop as the connection is closing.
                    }
                }
            }
            Err(e) => {
                // Log an error if receiving a message fails.
                logger::warn("client", &format!("[{}] Error receiving message: {}", client_id, e));
                break; // Exit the loop on error.
            }
        }
    }

    // Log that the WebSocket connection has been closed.
    logger::info("client", &format!("[{}] WebSocket connection closed", client_id));
}
