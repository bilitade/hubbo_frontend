import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { CheckSquare, X, Plus, Bot, Sparkles, Trash2, Edit } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { TaskCreate } from '../../types/api';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId?: string;
  projectContext?: {
    title: string;
    description?: string;
    project_brief?: string;
    desired_outcomes?: string;
  };
}

interface GeneratedTask {
  title: string;
  description: string;
  priority: string;
  activities: Array<{
    title: string;
    completed: boolean;
  }>;
  originalActivities?: string[]; // Store original string activities
}

export function AddTaskModal({ open, onOpenChange, onSuccess, projectId, projectContext }: AddTaskModalProps) {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [generating, setGenerating] = useState(false);
  const [numTasks, setNumTasks] = useState(5);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newActivityText, setNewActivityText] = useState<Record<number, string>>({});

  const handleClose = () => {
    onOpenChange(false);
    setTasks([]);
    setSelectedTasks(new Set());
    setNumTasks(5);
  };

  const handleGenerateTasks = async () => {
    if (!projectContext) {
      alert('Project context is required');
      return;
    }

    setGenerating(true);
    try {
      const response = await apiClient.generateTasks({
        project_title: projectContext.title,
        project_description: projectContext.description,
        project_brief: projectContext.project_brief,
        project_outcomes: projectContext.desired_outcomes,
        num_tasks: numTasks,
      });

      if (response.success && response.tasks) {
        // Convert string activities to objects
        const convertedTasks = response.tasks.map(task => ({
          ...task,
          activities: task.activities.map(activityStr => ({
            title: activityStr,
            completed: false,
          })),
          originalActivities: task.activities,
        }));

        setTasks(convertedTasks);
        // Select all tasks by default
        setSelectedTasks(new Set(convertedTasks.map((_, idx) => idx)));
      }
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      alert('Failed to generate tasks with AI');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTaskSelection = (index: number) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleActivity = (taskIndex: number, activityIndex: number) => {
    setTasks(prev => prev.map((task, tIdx) => {
      if (tIdx === taskIndex) {
        return {
          ...task,
          activities: task.activities.map((activity, aIdx) => {
            if (aIdx === activityIndex) {
              return { ...activity, completed: !activity.completed };
            }
            return activity;
          })
        };
      }
      return task;
    }));
  };

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, idx) => idx !== index));
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const removeActivity = (taskIndex: number, activityIndex: number) => {
    setTasks(prev => prev.map((task, tIdx) => {
      if (tIdx === taskIndex) {
        return {
          ...task,
          activities: task.activities.filter((_, aIdx) => aIdx !== activityIndex)
        };
      }
      return task;
    }));
  };

  const addActivity = (taskIndex: number) => {
    const newActivity = newActivityText[taskIndex]?.trim();
    if (!newActivity) return;

    setTasks(prev => prev.map((task, tIdx) => {
      if (tIdx === taskIndex) {
        return {
          ...task,
          activities: [...task.activities, { title: newActivity, completed: false }]
        };
      }
      return task;
    }));

    setNewActivityText(prev => ({ ...prev, [taskIndex]: '' }));
  };

  const updateTaskField = (taskIndex: number, field: 'title' | 'description', value: string) => {
    setTasks(prev => prev.map((task, idx) => {
      if (idx === taskIndex) {
        return { ...task, [field]: value };
      }
      return task;
    }));
  };

  const handleCreateTasks = async () => {
    if (selectedTasks.size === 0) {
      alert('Please select at least one task');
      return;
    }

    if (!projectId) {
      alert('Project ID is required');
      return;
    }

    try {
      const selectedTasksData = Array.from(selectedTasks).map(idx => tasks[idx]);
      
      for (const task of selectedTasksData) {
        const taskData: TaskCreate = {
          title: task.title,
          description: task.description,
          status: 'in_progress',
          project_id: projectId,
          activities: task.activities.map(activity => ({
            title: activity.title,
            completed: activity.completed,
          })),
        };
        
        await apiClient.createTask(taskData);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create tasks:', error);
      alert('Failed to create tasks');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'bg-red-100 text-red-700 border-red-300',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'low': 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-green-500" />
              Generate Tasks with AI
            </DialogTitle>
            <DialogDescription className="text-base">
              {projectContext?.title 
                ? `AI will generate tasks and subtasks for: ${projectContext.title}`
                : 'Generate tasks for your project using AI'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {tasks.length === 0 ? (
            // AI Generation Section
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 rounded-lg p-6 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">AI Task Generation</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will analyze your project and generate comprehensive tasks with subtasks (activities/checklists)
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-background/50 rounded-lg p-3 border">
                        <p className="font-medium mb-1">Project: {projectContext?.title || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {projectContext?.description || 'No description'}
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border">
                        <p className="font-medium mb-1">What AI Will Generate:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• {numTasks} main tasks</li>
                          <li>• 3-5 subtasks per task</li>
                          <li>• Priority levels</li>
                          <li>• Logical task flow</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="num-tasks" className="text-sm font-semibold mb-2 block">
                      Number of Tasks to Generate
                    </Label>
                    <Input
                      id="num-tasks"
                      type="number"
                      min="1"
                      max="20"
                      value={numTasks}
                      onChange={(e) => setNumTasks(parseInt(e.target.value) || 5)}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="default"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleGenerateTasks}
                  disabled={generating || !projectContext}
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Tasks with AI...
                    </>
                  ) : (
                    <>
                      <Bot className="h-5 w-5 mr-2" />
                      Generate Tasks with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Generated Tasks Display
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <div>
                  <p className="font-semibold">Generated {tasks.length} Tasks</p>
                  <p className="text-xs text-muted-foreground">
                    Select the tasks you want to create ({selectedTasks.size} selected)
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTasks([])}
                >
                  Regenerate
                </Button>
              </div>

              {tasks.map((task, taskIdx) => {
                const isSelected = selectedTasks.has(taskIdx);
                const isEditing = editingTask === taskIdx;
                
                return (
                  <div 
                    key={taskIdx}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-background opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTaskSelection(taskIdx)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          {isEditing ? (
                            <Input
                              value={task.title}
                              onChange={(e) => updateTaskField(taskIdx, 'title', e.target.value)}
                              className="flex-1 font-semibold"
                            />
                          ) : (
                            <h4 className="font-semibold text-base flex-1">{task.title}</h4>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge className={`${getPriorityColor(task.priority)} text-xs whitespace-nowrap`}>
                              {task.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setEditingTask(isEditing ? null : taskIdx)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeTask(taskIdx)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <textarea
                            value={task.description}
                            onChange={(e) => updateTaskField(taskIdx, 'description', e.target.value)}
                            className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                    </div>

                    {task.activities && task.activities.length > 0 && (
                      <div className="ml-9 mt-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          Subtasks ({task.activities.length}):
                        </p>
                        {task.activities.map((activity, actIdx) => (
                          <div 
                            key={actIdx}
                            className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2 group"
                          >
                            <Checkbox
                              checked={activity.completed}
                              onCheckedChange={() => toggleActivity(taskIdx, actIdx)}
                            />
                            <span className={`text-sm flex-1 ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {activity.title}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeActivity(taskIdx, actIdx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Add new activity */}
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newActivityText[taskIdx] || ''}
                            onChange={(e) => setNewActivityText(prev => ({ ...prev, [taskIdx]: e.target.value }))}
                            placeholder="Add new subtask..."
                            className="flex-1 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addActivity(taskIdx);
                              }
                            }}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => addActivity(taskIdx)}
                            disabled={!newActivityText[taskIdx]?.trim()}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 border-t pt-4 space-y-3">
          {tasks.length > 0 && (
            <>
              {/* Primary Action */}
              <Button 
                onClick={handleCreateTasks} 
                disabled={selectedTasks.size === 0} 
                className="w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
              </Button>
              
              {/* Cancel */}
              <Button variant="ghost" onClick={handleClose} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          
          {tasks.length === 0 && (
            <Button variant="ghost" onClick={handleClose} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

