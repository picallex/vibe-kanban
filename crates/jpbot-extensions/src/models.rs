//! JPBot Extensions - Database Models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use ts_rs::TS;
use uuid::Uuid;

/// Task assignee - stores the assignee for a task
#[derive(Debug, Clone, FromRow, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TaskAssignee {
    pub task_id: Uuid,
    pub assignee: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request to set/update a task assignee
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SetTaskAssignee {
    pub assignee: String,
}

/// Task with assignee info (for responses)
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TaskAssigneeInfo {
    pub task_id: Uuid,
    pub assignee: Option<String>,
}
