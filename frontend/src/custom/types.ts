/**
 * JPBot Custom Extensions - TypeScript Types
 *
 * Types for custom extensions. These mirror the Rust models
 * in crates/jpbot-extensions/src/models.rs
 */

export interface TaskAssignee {
  task_id: string;
  assignee: string;
  created_at: string;
  updated_at: string;
}

export interface SetTaskAssignee {
  assignee: string;
}

export interface TaskAssigneeInfo {
  task_id: string;
  assignee: string | null;
}
