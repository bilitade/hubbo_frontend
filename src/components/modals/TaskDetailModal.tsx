import { useState, useEffect, useRef } from 'react';
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
  Send,
  Check,
  Circle,
  Clock,
  PartyPopper,
  Edit,
  Trash2,
  Save,
  Plus,
  Paperclip,
  Download,
  FileText,
  Upload,
  History
} from 'lucide-react';
import { apiClient } from '../../services/api';
import type { TaskDetailResponse, TaskActivityResponse, TaskActivityLogResponse, TaskAttachmentResponse, UserResponse } from '../../types/api';

interface TaskDetailModalProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TaskDetailModal({ taskId, open, onOpenChange, onSuccess }: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [editingAssignments, setEditingAssignments] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [accountableId, setAccountableId] = useState<string>('');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editedSubtaskText, setEditedSubtaskText] = useState('');
  const [activityLog, setActivityLog] = useState<TaskActivityLogResponse[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'activity'>('comments');

  useEffect(() => {
    if (taskId && open) {
      loadTaskDetails();
      loadUsers();
      loadActivityLog();
    }
  }, [taskId, open]);

  const loadTaskDetails = async () => {
    if (!taskId) return;

    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getTask(taskId);
      setTask(data);
      setAssignedTo(data.assigned_to || '');
      setAccountableId(data.accountable_id || '');
      setEditedTitle(data.title);
      setEditedDescription(data.description || '');
    } catch (error) {
      console.error('Failed to load task:', error);
      setLoadError('We could not load the task details. Please try again.');
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

  const loadActivityLog = async () => {
    if (!taskId) return;
    
    try {
      const logs = await apiClient.getTaskActivityLog(taskId);
      setActivityLog(logs);
    } catch (error) {
      console.error('Failed to load activity log:', error);
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
      
      // Reload activity log
      await loadActivityLog();
      
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
          await loadActivityLog(); // Reload activity log again
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
          await loadActivityLog(); // Reload activity log again
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
      await loadActivityLog(); // Reload activity log
      onSuccess(); // Refresh parent to update kanban columns
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
    setEditingTask(false);
    setShowDeleteConfirm(false);
  };

  const handleEditTask = () => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditingTask(true);
    }
  };

  const handleSaveTask = async () => {
    if (!taskId || !editedTitle.trim()) return;

    try {
      await apiClient.updateTask(taskId, {
        title: editedTitle,
        description: editedDescription || undefined,
      });
      setEditingTask(false);
      await loadTaskDetails();
      await loadActivityLog(); // Reload activity log
      onSuccess();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) return;

    try {
      await apiClient.deleteTask(taskId);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleAddSubtask = async () => {
    if (!taskId || !newSubtask.trim()) return;

    try {
      await apiClient.createTaskActivity(taskId, { title: newSubtask.trim(), completed: false });
      setNewSubtask('');
      await loadTaskDetails();
      await loadActivityLog(); // Reload activity log
      onSuccess();
    } catch (error) {
      console.error('Failed to add subtask:', error);
      alert('Failed to add subtask');
    }
  };

  const handleEditSubtask = (activity: TaskActivityResponse) => {
    setEditingSubtaskId(activity.id);
    setEditedSubtaskText(activity.title);
  };

  const handleSaveSubtask = async (activityId: string) => {
    if (!taskId || !editedSubtaskText.trim()) return;

    try {
      await apiClient.updateTaskActivity(taskId, activityId, { title: editedSubtaskText.trim() });
      setEditingSubtaskId(null);
      setEditedSubtaskText('');
      await loadTaskDetails();
      await loadActivityLog(); // Reload activity log
      onSuccess();
    } catch (error) {
      console.error('Failed to update subtask:', error);
      alert('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (activityId: string) => {
    if (!taskId) return;
    if (!confirm('Delete this subtask?')) return;

    try {
      await apiClient.deleteTaskActivity(taskId, activityId);
      await loadTaskDetails();
      await loadActivityLog(); // Reload activity log
      onSuccess();
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      alert('Failed to delete subtask');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!taskId || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploadingFile(true);

    try {
      await apiClient.uploadTaskAttachment(taskId, file);
      await loadTaskDetails();
      await loadActivityLog(); // Reload activity log
      onSuccess();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadAttachment = async (attachment: TaskAttachmentResponse) => {
    if (!taskId) return;

    try {
      await apiClient.downloadTaskAttachment(taskId, attachment.id, attachment.file_name);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!taskId) return;
    if (!confirm('Delete this attachment?')) return;

    try {
      await apiClient.deleteTaskAttachment(taskId, attachmentId);
      await loadTaskDetails();
      await loadActivityLog(); // Reload activity log
      onSuccess();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      alert('Failed to delete attachment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'unassigned': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getActionLabel = (action: string): { icon: any; label: string; color: string } => {
    const actionMap: Record<string, { icon: any; label: string; color: string }> = {
      'updated': { icon: Edit, label: 'Updated', color: 'text-blue-600' },
      'activity_added': { icon: Plus, label: 'Added subtask', color: 'text-green-600' },
      'activity_updated': { icon: Edit, label: 'Updated subtask', color: 'text-blue-600' },
      'activity_deleted': { icon: Trash2, label: 'Deleted subtask', color: 'text-red-600' },
      'status_auto_updated': { icon: CheckSquare, label: 'Status auto-updated', color: 'text-purple-600' },
      'attachment_uploaded': { icon: Upload, label: 'Uploaded file', color: 'text-green-600' },
      'attachment_deleted': { icon: Trash2, label: 'Deleted file', color: 'text-red-600' },
      'comment_added': { icon: Send, label: 'Added comment', color: 'text-blue-600' },
      'comment_deleted': { icon: Trash2, label: 'Deleted comment', color: 'text-red-600' },
    };
    return actionMap[action] || { icon: History, label: action, color: 'text-gray-600' };
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    if (mimeType.includes('text')) return '📃';
    if (mimeType.includes('csv')) return '📋';
    return '📎';
  };

  if (!task) {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClose();
          } else {
            onOpenChange(isOpen);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            {loading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  {loadError ?? 'Select a task to view its full details.'}
                </p>
                {loadError && (
                  <Button variant="outline" size="sm" onClick={loadTaskDetails}>
                    Retry
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <DialogTitle className="text-xl font-bold mb-2">Delete Task</DialogTitle>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this task? This will also delete all subtasks, comments, and attachments. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] min-w-[900px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                {editingTask ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl font-bold h-10 mb-2"
                    placeholder="Task title"
                  />
                ) : (
                  <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
                )}
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
            <div className="flex gap-2">
              {editingTask ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditingTask(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveTask}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleEditTask}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
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
          {editingTask ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter task description..."
                className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          ) : task.description ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-muted/30 p-3 rounded-md">
                {task.description}
              </p>
            </div>
          ) : null}

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

            {/* Subtasks List */}
            {task.activities && task.activities.length > 0 ? (
              <div className="space-y-2">
                {task.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-2 p-3 bg-card hover:bg-muted/50 rounded-lg border transition-all group"
                  >
                    <button
                      onClick={() => handleToggleActivity(activity.id, activity.completed)}
                      className="flex-shrink-0"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        activity.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 group-hover:border-blue-500'
                      }`}>
                        {activity.completed && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                    
                    {editingSubtaskId === activity.id ? (
                      <Input
                        value={editedSubtaskText}
                        onChange={(e) => setEditedSubtaskText(e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="Subtask title"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveSubtask(activity.id);
                          } else if (e.key === 'Escape') {
                            setEditingSubtaskId(null);
                          }
                        }}
                      />
                    ) : (
                      <span className={`flex-1 text-sm ${
                        activity.completed 
                          ? 'line-through text-muted-foreground' 
                          : 'text-foreground'
                      }`}>
                        {activity.title}
                      </span>
                    )}
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingSubtaskId === activity.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSubtaskId(null)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveSubtask(activity.id)}
                            className="h-7 w-7 p-0 text-green-600"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSubtask(activity)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubtask(activity.id)}
                            className="h-7 w-7 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {activity.completed && (
                      <Badge variant="secondary" className="text-xs">
                        Done
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/30 rounded-lg border-2 border-dashed">
                <Circle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No subtasks yet</p>
              </div>
            )}

            {/* Add New Subtask */}
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add new subtask..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <Button
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                size="sm"
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Send className="h-4 w-4" />
                Comments ({task.comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'attachments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Paperclip className="h-4 w-4" />
                Attachments ({task.attachments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <History className="h-4 w-4" />
                Activity Log ({activityLog.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <>
                {/* Comments List */}
                {task.comments && task.comments.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                    <Send className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">No comments yet</p>
                  </div>
                )}

                {/* Add Comment */}
                <div className="space-y-2 pt-2 border-t">
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
              </>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <>
                <div className="flex justify-end pb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.json"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="h-8"
                  >
                    {uploadingFile ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload File
                      </>
                    )}
                  </Button>
                </div>

                {task.attachments && task.attachments.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {task.attachments.map((attachment) => (
                      <Card key={attachment.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getFileIcon(attachment.mime_type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(attachment.file_size)}</span>
                              <span>•</span>
                              <span>Uploaded by {getUserName(attachment.uploaded_by)}</span>
                              <span>•</span>
                              <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground mb-2">No attachments yet</p>
                    <p className="text-xs text-muted-foreground">Upload files like PDFs, documents, spreadsheets, etc.</p>
                  </div>
                )}
              </>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <>
                {activityLog.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {activityLog.map((log) => {
                      const actionInfo = getActionLabel(log.action);
                      const ActionIcon = actionInfo.icon;
                      return (
                        <div key={log.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className={`flex-shrink-0 ${actionInfo.color}`}>
                            <ActionIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${actionInfo.color}`}>
                                {actionInfo.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                by {getUserName(log.user_id)}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-xs text-muted-foreground mb-1">{log.details}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleDateString()} at{' '}
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                    <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">No activity logged yet</p>
                  </div>
                )}
              </>
            )}
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

