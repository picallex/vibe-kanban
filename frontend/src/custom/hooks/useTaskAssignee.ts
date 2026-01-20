/**
 * JPBot Custom Extensions - Task Assignee Hook
 *
 * Hook for managing task assignees.
 */

import { useState, useCallback, useEffect } from 'react';
import { TaskAssigneeInfo, SetTaskAssignee } from '../types';

// API functions for task assignees
export const assigneeApi = {
  get: async (taskId: string): Promise<TaskAssigneeInfo> => {
    const response = await fetch(`/api/custom/tasks/${taskId}/assignee`);
    if (!response.ok) {
      throw new Error('Failed to get assignee');
    }
    return response.json();
  },

  set: async (taskId: string, data: SetTaskAssignee): Promise<TaskAssigneeInfo> => {
    const response = await fetch(`/api/custom/tasks/${taskId}/assignee`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to set assignee');
    }
    return response.json();
  },

  remove: async (taskId: string): Promise<void> => {
    const response = await fetch(`/api/custom/tasks/${taskId}/assignee`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove assignee');
    }
  },
};

interface UseTaskAssigneeOptions {
  taskId?: string;
  initialAssignee?: string;
}

export function useTaskAssignee(options: UseTaskAssigneeOptions = {}) {
  const { taskId, initialAssignee } = options;
  const [assignee, setAssignee] = useState<string>(initialAssignee || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load assignee when taskId changes (for edit mode)
  useEffect(() => {
    if (!taskId) return;

    const loadAssignee = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await assigneeApi.get(taskId);
        setAssignee(data.assignee || '');
      } catch (e) {
        // Don't set error for 404 (no assignee yet)
        console.log('No assignee found for task');
      } finally {
        setLoading(false);
      }
    };

    loadAssignee();
  }, [taskId]);

  const saveAssignee = useCallback(async (taskIdToSave: string) => {
    if (!assignee.trim()) {
      // Remove assignee if empty
      try {
        await assigneeApi.remove(taskIdToSave);
      } catch {
        // Ignore errors when removing (might not exist)
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await assigneeApi.set(taskIdToSave, { assignee: assignee.trim() });
    } catch (e) {
      setError('Failed to save assignee');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [assignee]);

  return {
    assignee,
    setAssignee,
    saveAssignee,
    loading,
    error,
  };
}
