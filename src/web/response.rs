use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub meta: Option<serde_json::Value>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T, meta: Option<serde_json::Value>) -> Self {
        Self {
            success: true,
            data: Some(data),
            meta,
        }
    }

    pub fn fail(msg: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            meta: Some(serde_json::json!({ "error": msg.into() })),
        }
    }
}
