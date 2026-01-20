//! Custom API routes for JPBot extensions
//!
//! Note: The actual route handlers are in crates/server/src/routes/jpbot_custom.rs
//! This file is kept for backwards compatibility and simple stateless routes.

use axum::{Router, routing::get, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct HelloResponse {
    pub message: String,
    pub feature_enabled: bool,
}

/// GET /api/custom/hello
/// Returns a hello message - this is a demo endpoint
pub async fn hello() -> Json<HelloResponse> {
    tracing::info!("JPBot custom hello endpoint called");
    Json(HelloResponse {
        message: "Hola desde JPBot Extensions!".to_string(),
        feature_enabled: true,
    })
}

/// Creates the custom routes router (stateless routes only)
/// For routes with database access, see crates/server/src/routes/jpbot_custom.rs
pub fn router<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/hello", get(hello))
}
