//! JPBot Custom Routes
//!
//! Custom API routes for JPBot extensions.
//! Only compiled when feature "jpbot-custom" is enabled.

use axum::{
    Router,
    extract::{Path, State},
    routing::{get, put, delete},
    Json,
    http::StatusCode,
    response::Json as ResponseJson,
};
use deployment::Deployment;
use jpbot_extensions::{SetTaskAssignee, TaskAssignee, TaskAssigneeInfo};
use serde::Serialize;
use uuid::Uuid;

use crate::DeploymentImpl;

#[derive(Serialize)]
pub struct HelloResponse {
    pub message: String,
    pub feature_enabled: bool,
}

/// GET /api/custom/hello
pub async fn hello() -> Json<HelloResponse> {
    tracing::info!("JPBot custom hello endpoint called");
    Json(HelloResponse {
        message: "Hola desde JPBot Extensions!".to_string(),
        feature_enabled: true,
    })
}

/// GET /api/custom/tasks/:task_id/assignee
pub async fn get_task_assignee(
    State(deployment): State<DeploymentImpl>,
    Path(task_id): Path<Uuid>,
) -> Result<ResponseJson<TaskAssigneeInfo>, StatusCode> {
    let pool = &deployment.db().pool;

    let assignee = sqlx::query_as::<_, TaskAssignee>(
        "SELECT task_id, assignee, created_at, updated_at FROM task_assignees WHERE task_id = ?"
    )
    .bind(task_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to get task assignee: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(ResponseJson(TaskAssigneeInfo {
        task_id,
        assignee: assignee.map(|a| a.assignee),
    }))
}

/// PUT /api/custom/tasks/:task_id/assignee
pub async fn set_task_assignee(
    State(deployment): State<DeploymentImpl>,
    Path(task_id): Path<Uuid>,
    Json(payload): Json<SetTaskAssignee>,
) -> Result<ResponseJson<TaskAssigneeInfo>, StatusCode> {
    let pool = &deployment.db().pool;

    sqlx::query(
        r#"
        INSERT INTO task_assignees (task_id, assignee, created_at, updated_at)
        VALUES (?, ?, datetime('now', 'subsec'), datetime('now', 'subsec'))
        ON CONFLICT(task_id) DO UPDATE SET
            assignee = excluded.assignee,
            updated_at = datetime('now', 'subsec')
        "#
    )
    .bind(task_id)
    .bind(&payload.assignee)
    .execute(pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to set task assignee: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("Set assignee '{}' for task {}", payload.assignee, task_id);

    Ok(ResponseJson(TaskAssigneeInfo {
        task_id,
        assignee: Some(payload.assignee),
    }))
}

/// DELETE /api/custom/tasks/:task_id/assignee
pub async fn delete_task_assignee(
    State(deployment): State<DeploymentImpl>,
    Path(task_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let pool = &deployment.db().pool;

    sqlx::query("DELETE FROM task_assignees WHERE task_id = ?")
        .bind(task_id)
        .execute(pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to delete task assignee: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    tracing::info!("Removed assignee for task {}", task_id);

    Ok(StatusCode::NO_CONTENT)
}

/// Creates the JPBot custom routes router
pub fn router() -> Router<DeploymentImpl> {
    Router::new()
        .route("/hello", get(hello))
        .route("/tasks/{task_id}/assignee", get(get_task_assignee))
        .route("/tasks/{task_id}/assignee", put(set_task_assignee))
        .route("/tasks/{task_id}/assignee", delete(delete_task_assignee))
}
