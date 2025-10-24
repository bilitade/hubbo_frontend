import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckSquare, 
  X, 
  User, 
  Calendar, 
  MessageSquare, 
  Send,
  Check,
  Circle,
  Clock,
  PartyPopper
} from 'lucide-react';
import { apiClient } from '../../services/api';
import type { TaskDetailResponse, TaskActivityResponse, TaskCommentResponse, UserResponse } from '../../types/api';

interface TaskDetailModalProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TaskDetailModal({ taskId, open, onOpenChange, onSuccess }: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [editingAssignments, setEditingAssignments] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [accountableId, setAccountableId] = useState<string>('');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  useEffect(() => {
    if (taskId && open) {
      loadTaskDetails();
      loadUsers();
    }
  }, [taskId, open]);

  const loadTaskDetails = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const data = await apiClient.getTask(taskId);
      setTask(data);
      setAssignedTo(data.assigned_to || '');
      setAccountableId(data.accountable_id || '');
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await apiClient.listUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleToggleActivity = async (activityId: string, currentStatus: boolean) => {
    if (!taskId || !task) return;

    try {
      await apiClient.updateTaskActivity(taskId, activityId, !currentStatus);
      
      // Reload task details to get updated activities
      const updatedTask = await apiClient.getTask(taskId);
      setTask(updatedTask);
      setAssignedTo(updatedTask.assigned_to || '');
      setAccountableId(updatedTask.accountable_id || '');
      
      // Check if all activities are now completed
      if (updatedTask.activities && updatedTask.activities.length > 0) {
        const allCompleted = updatedTask.activities.every(a => a.completed);
        const someIncomplete = updatedTask.activities.some(a => !a.completed);
        
        // If all subtasks are completed and task is not already done, mark it as completed
        if (allCompleted && updatedTask.status !== 'completed' && updatedTask.status !== 'done') {
          await apiClient.updateTask(taskId, { status: 'completed' });
          // Reload again to reflect the status change
          const finalTask = await apiClient.getTask(taskId);
          setTask(finalTask);
          onSuccess(); // Refresh parent components
          
          // Show completion message
          setShowCompletionMessage(true);
          setTimeout(() => setShowCompletionMessage(false), 5000);
        }
        // If any subtask is unchecked and task is completed/done, revert to in_progress
        else if (someIncomplete && (updatedTask.status === 'completed' || updatedTask.status === 'done')) {
          await apiClient.updateTask(taskId, { status: 'in_progress' });
          // Reload again to reflect the status change
          const finalTask = await apiClient.getTask(taskId);
          setTask(finalTask);
          onSuccess(); // Refresh parent components
        }
      }
    } catch (error) {
      console.error('Failed to toggle activity:', error);
      alert('Failed to update subtask');
    }
  };

  const handleAddComment = async () => {
    if (!taskId || !comment.trim()) return;

    setSubmittingComment(true);
    try {
      await apiClient.createTaskComment(taskId, { content: comment });
      setComment('');
      await loadTaskDetails();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateAssignments = async () => {
    if (!taskId) return;

    try {
      await apiClient.updateTask(taskId, {
        assigned_to: assignedTo || undefined,
        accountable_id: accountableId || undefined,
      });
      setEditingAssignments(false);
      await loadTaskDetails();
      onSuccess();
    } catch (error) {
      console.error('Failed to update assignments:', error);
      alert('Failed to update assignments');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTask(null);
    setComment('');
    setEditingAssignments(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'todo': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'done': 'bg-green-100 text-green-700',
      'blocked': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  if (!task && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] min-w-[900px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </Badge>
                {task.backlog && (
                  <Badge variant="secondary" className="text-xs">
                    {task.backlog.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-6 min-h-0">
          {/* Completion Message */}
          {showCompletionMessage && (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 dark:from-green-950 dark:to-emerald-950">
              <PartyPopper className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm font-medium text-green-700 dark:text-green-400">
                🎉 Congratulations! All subtasks completed. Task marked as completed!
              </AlertDescription>
            </Alert>
          )}

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-muted/30 p-3 rounded-md">
                {task.description}
              </p>
            </div>
          )}

          {/* Assignments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-muted-foreground">Assignments</Label>
              {!editingAssignments && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingAssignments(true)}
                  className="h-7 text-xs"
                >
                  Edit
                </Button>
              )}
            </div>

            {editingAssignments ? (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="assigned-to" className="text-xs font-medium">
                    Assigned To (Responsible)
                  </Label>
                  <select
                    id="assigned-to"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">-- Select User --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountable" className="text-xs font-medium">
                    Accountable Person
                  </Label>
                  <select
                    id="accountable"
                    value={accountableId}
                    onChange={(e) => setAccountableId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">-- Select User --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAssignments(false);
                      setAssignedTo(task.assigned_to || '');
                      setAccountableId(task.accountable_id || '');
                    }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateAssignments}
                    className="h-8"
                  >
                    Save Assignments
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Responsible</p>
                    <p className="text-sm font-medium">{getUserName(task.assigned_to)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <User className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Accountable</p>
                    <p className="text-sm font-medium">{getUserName(task.accountable_id)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium">
                  {new Date(task.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Subtasks (Activities) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-muted-foreground">
                Subtasks ({task.activities?.filter(a => a.completed).length || 0}/{task.activities?.length || 0})
              </Label>
              {task.activities && task.activities.length > 0 && task.activities.every(a => a.completed) && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  All Complete!
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            {task.activities && task.activities.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      task.activities.every(a => a.completed)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                    style={{
                      width: `${(task.activities.filter(a => a.completed).length / task.activities.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round((task.activities.filter(a => a.completed).length / task.activities.length) * 100)}%
                </span>
              </div>
            )}

            {task.activities && task.activities.length > 0 ? (
              <div className="space-y-2">
                {task.activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleToggleActivity(activity.id, activity.completed)}
                    className="w-full flex items-center gap-3 p-3 bg-card hover:bg-muted/50 rounded-lg border transition-all group text-left"
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      activity.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 group-hover:border-blue-500'
                    }`}>
                      {activity.completed && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${
                      activity.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}>
                      {activity.title}
                    </span>
                    {activity.completed && (
                      <Badge variant="secondary" className="text-xs">
                        Done
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/30 rounded-lg border-2 border-dashed">
                <Circle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No subtasks yet</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground">
              Comments ({task.comments?.length || 0})
            </Label>

            {/* Comments List */}
            {task.comments && task.comments.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {task.comments.map((comment) => (
                  <Card key={comment.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold">{getUserName(comment.user_id)}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()} at{' '}
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || submittingComment}
                  size="sm"
                  className="h-9 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {submittingComment ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created
              </Label>
              <p className="text-sm">
                {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Updated
              </Label>
              <p className="text-sm">
                {new Date(task.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-9">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

