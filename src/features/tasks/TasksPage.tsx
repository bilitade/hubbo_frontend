import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { apiClient } from '../../services/api';
import type { 
  TaskResponse, 
  TaskCreate, 
  TaskUpdate, 
  TaskDetailResponse,
  TaskActivityCreate,
  TaskCommentCreate
} from '../../types/api';

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDetailResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    description: '',
    status: 'in_progress',
    backlog: '',
  });

  useEffect(() => {
    loadTasks();
  }, [filterStatus]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listTasks(0, 100, filterStatus || undefined);
      setTasks(response.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await apiClient.createTask(formData);
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        status: 'in_progress',
        backlog: '',
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTask) return;
    try {
      const updateData: TaskUpdate = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        backlog: formData.backlog,
      };
      await apiClient.updateTask(selectedTask.id, updateData);
      setShowEditDialog(false);
      setSelectedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiClient.deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const openEditDialog = (task: TaskResponse) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      backlog: task.backlog || '',
    });
    loadTaskDetails(task.id).then(() => {
      setShowEditDialog(true);
    });
  };

  const loadTaskDetails = async (taskId: string) => {
    try {
      const details = await apiClient.getTask(taskId);
      setSelectedTask(details);
    } catch (error) {
      console.error('Failed to load task details:', error);
    }
  };

  const openDetailDialog = async (task: TaskResponse) => {
    await loadTaskDetails(task.id);
    setShowDetailDialog(true);
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;
    try {
      await apiClient.createTaskComment(selectedTask.id, { content: newComment });
      setNewComment('');
      await loadTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddActivity = async () => {
    if (!selectedTask || !newActivity.trim()) return;
    try {
      const activityData: TaskActivityCreate = {
        title: newActivity,
        completed: false,
      };
      await apiClient.createTaskActivity(selectedTask.id, activityData);
      setNewActivity('');
      await loadTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const handleToggleActivity = async (activityId: string, completed: boolean) => {
    if (!selectedTask) return;
    try {
      await apiClient.updateTaskActivity(selectedTask.id, activityId, !completed);
      await loadTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Failed to toggle activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!selectedTask) return;
    try {
      await apiClient.deleteTaskActivity(selectedTask.id, activityId);
      await loadTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedTask) return;
    try {
      await apiClient.deleteTaskComment(selectedTask.id, commentId);
      await loadTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      in_review: 'bg-yellow-500',
      completed: 'bg-green-500',
      blocked: 'bg-red-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Label htmlFor="filter-status">Status</Label>
        <select
          id="filter-status"
          className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openDetailDialog(task)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {getStatusBadge(task.status)}
              </div>
              {task.backlog && (
                <CardDescription className="text-xs">Backlog: {task.backlog}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{task.description}</p>
              )}
              {task.due_date && (
                <p className="text-xs text-muted-foreground mb-2">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(task);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your list</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the task"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backlog">Backlog</Label>
                <Input
                  id="backlog"
                  value={formData.backlog}
                  onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-backlog">Backlog</Label>
                <Input
                  id="edit-backlog"
                  value={formData.backlog}
                  onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              {getStatusBadge(selectedTask?.status || '')}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-6 py-4">
              {/* Description */}
              {selectedTask.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>
              )}

              {/* Activities */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Activities ({selectedTask.activities?.length || 0})
                </h3>
                <div className="space-y-2 mb-4">
                  {selectedTask.activities?.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Checkbox
                        checked={activity.completed}
                        onCheckedChange={() => handleToggleActivity(activity.id, activity.completed)}
                      />
                      <span className={activity.completed ? 'line-through text-muted-foreground' : ''}>
                        {activity.title}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new activity..."
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                  />
                  <Button onClick={handleAddActivity}>Add</Button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({selectedTask.comments?.length || 0})
                </h3>
                <div className="space-y-2 mb-4">
                  {selectedTask.comments?.map((comment) => (
                    <div key={comment.id} className="p-3 bg-muted rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleAddComment}>Post</Button>
                </div>
              </div>

              {/* Attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({selectedTask.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedTask.attachments.map((attachment) => (
                      <div key={attachment.id} className="p-2 bg-muted rounded flex justify-between items-center">
                        <span className="text-sm">{attachment.file_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(attachment.file_size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

