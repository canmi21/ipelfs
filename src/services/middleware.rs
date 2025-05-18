/* services/middleware.rs */

use axum::{
    extract::Request, // This is axum::http::Request<axum::body::Body> when used as an extractor
    http::{header, HeaderValue, Method},
    middleware::Next,
    response::Response,
};
use tower_http::cors::{Any, CorsLayer};

/// Creates a CORS middleware layer that allows requests from any origin.
pub fn create_cors_layer() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(Any) // Allows all origins
        .allow_methods(vec![
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
            Method::PATCH,
        ])
        .allow_headers(Any) // Allows all headers
}

/// Middleware to add no-cache headers to every response.
pub async fn no_cache_middleware(
    // 'req' will be of type axum::http::Request<axum::body::Body>.
    // The axum::extract::Request extractor handles this.
    req: Request,
    // 'next' is of type axum::middleware::Next, which is not generic.
    next: Next,
) -> Response {
    // Pass the request to the next middleware or handler.
    // req is already the correct type http::Request<axum::body::Body>
    let mut response = next.run(req).await;

    // Modify the response headers.
    let headers = response.headers_mut();
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("no-store, no-cache, must-revalidate, proxy-revalidate"),
    );
    headers.insert(header::PRAGMA, HeaderValue::from_static("no-cache"));
    headers.insert(header::EXPIRES, HeaderValue::from_static("0"));
    response
}