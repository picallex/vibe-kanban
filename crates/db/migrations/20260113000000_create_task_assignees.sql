-- JPBot Extension: Task Assignees
-- Tabla separada para mantener assignees de tareas sin modificar la tabla tasks
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS task_assignees (
    task_id     BLOB PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
    assignee    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec'))
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_assignee
    ON task_assignees (assignee);
