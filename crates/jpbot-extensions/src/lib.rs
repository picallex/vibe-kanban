//! JPBot Custom Extensions
//!
//! Este crate contiene todas las customizaciones propias de JPBot
//! que no vienen del upstream (vibe-kanban).
//!
//! Para activar: cargo build --features jpbot-custom
//! Para desactivar: cargo build (sin el feature)

pub mod models;
pub mod routes;

pub use models::*;
pub use routes::router as custom_router;
