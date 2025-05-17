use axum::{
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use serde::Serialize;
use crate::web::response::ApiResponse;

#[derive(Serialize)]
pub struct UserAgentData {
    user_agent: String,
}

pub async fn get_user_agent_handler(headers: HeaderMap) -> impl IntoResponse {
    let ua_string = headers
        .get(header::USER_AGENT)
        .and_then(|value| value.to_str().ok())
        .map(ToString::to_string)
        .unwrap_or_else(|| String::new());

    Json(ApiResponse::ok(
        UserAgentData { user_agent: ua_string }, 
        None
    ))
}