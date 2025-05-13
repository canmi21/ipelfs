use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
    pub meta: Option<serde_json::Value>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T, meta: Option<serde_json::Value>) -> Self {
        Self {
            success: true,
            data,
            meta,
        }
    }
}
