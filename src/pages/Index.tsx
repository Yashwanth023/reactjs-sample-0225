import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { TaskColumn } from '@/components/TaskColumn';
import { TaskDialog } from '@/components/TaskDialog';
import { TaskCard } from '@/components/TaskCard';
import { UserProfile } from '@/components/UserProfile';
import { AuthLayout } from '@/components/AuthLayout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/hooks/useAuth';
import { Task, Column } from '@/types/task';
import { Plus, Search, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', status: 'todo', tasks: [] },
  { id: 'inProgress', title: 'In Progress', status: 'inProgress', tasks: [] },
  { id: 'done', title: 'Done', status: 'done', tasks: [] },
];

const Index = () => {
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  const [columns, setColumns] = useLocalStorage<Column[]>('task-board-columns', initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'inProgress' | 'done'>('todo');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize with sample data if empty
  useEffect(() => {
    if (columns.every(col => col.tasks.length === 0)) {
      const sampleTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Design new landing page',
          description: 'Create mockups and prototypes for the new landing page design',
          status: 'todo',
          priority: 'high',
          assignee: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Implement user authentication',
          description: 'Add login and registration functionality',
          status: 'inProgress',
          priority: 'medium',
          assignee: 'Jane Smith',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-3',
          title: 'Fix responsive issues',
          description: 'Resolve mobile layout problems on the dashboard',
          status: 'done',
          priority: 'low',
          assignee: 'Mike Johnson',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const newColumns = [...columns];
      newColumns[0].tasks = [sampleTasks[0]];
      newColumns[1].tasks = [sampleTasks[1]];
      newColumns[2].tasks = [sampleTasks[2]];
      setColumns(newColumns);
    }
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setColumns((columns) => {
        const activeIndex = findTaskIndex(activeId as string);
        const overIndex = findTaskIndex(overId as string);

        if (activeIndex.columnIndex !== overIndex.columnIndex) {
          const activeTask = columns[activeIndex.columnIndex].tasks[activeIndex.taskIndex];
          const newStatus = columns[overIndex.columnIndex].status;
          
          activeTask.status = newStatus;
          activeTask.updatedAt = new Date();

          // Remove from source
          columns[activeIndex.columnIndex].tasks.splice(activeIndex.taskIndex, 1);
          
          // Add to destination
          columns[overIndex.columnIndex].tasks.splice(overIndex.taskIndex, 0, activeTask);
        } else {
          // Same column reordering
          columns[activeIndex.columnIndex].tasks = arrayMove(
            columns[activeIndex.columnIndex].tasks,
            activeIndex.taskIndex,
            overIndex.taskIndex
          );
        }

        return [...columns];
      });
    }

    // Dropping a task over a column
    const isOverAColumn = over.data.current?.type === 'Column';

    if (isActiveATask && isOverAColumn) {
      setColumns((columns) => {
        const activeIndex = findTaskIndex(activeId as string);
        const overColumnIndex = columns.findIndex(col => col.id === overId);

        if (activeIndex.columnIndex !== overColumnIndex) {
          const activeTask = columns[activeIndex.columnIndex].tasks[activeIndex.taskIndex];
          const newStatus = columns[overColumnIndex].status;
          
          activeTask.status = newStatus;
          activeTask.updatedAt = new Date();

          // Remove from source
          columns[activeIndex.columnIndex].tasks.splice(activeIndex.taskIndex, 1);
          
          // Add to destination
          columns[overColumnIndex].tasks.push(activeTask);
        }

        return [...columns];
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const findTaskById = (id: string): Task | undefined => {
    for (const column of columns) {
      const task = column.tasks.find(task => task.id === id);
      if (task) return task;
    }
  };

  const findTaskIndex = (id: string) => {
    for (let i = 0; i < columns.length; i++) {
      const taskIndex = columns[i].tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        return { columnIndex: i, taskIndex };
      }
    }
    return { columnIndex: -1, taskIndex: -1 };
  };

  const handleAddTask = (status: 'todo' | 'inProgress' | 'done') => {
    setNewTaskStatus(status);
    setEditingTask(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    setColumns(prev => {
      const newColumns = [...prev];
      
      if (editingTask) {
        // Update existing task
        const { columnIndex, taskIndex } = findTaskIndex(task.id);
        if (columnIndex !== -1) {
          newColumns[columnIndex].tasks[taskIndex] = task;
        }
        toast({
          title: 'Task updated',
          description: 'Your task has been successfully updated.',
        });
      } else {
        // Add new task
        const columnIndex = newColumns.findIndex(col => col.status === task.status);
        if (columnIndex !== -1) {
          newColumns[columnIndex].tasks.push(task);
        }
        toast({
          title: 'Task created',
          description: 'Your new task has been added to the board.',
        });
      }
      
      return newColumns;
    });
  };

  const handleDeleteTask = (id: string) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const { columnIndex, taskIndex } = findTaskIndex(id);
      
      if (columnIndex !== -1) {
        newColumns[columnIndex].tasks.splice(taskIndex, 1);
        toast({
          title: 'Task deleted',
          description: 'The task has been removed from the board.',
        });
      }
      
      return newColumns;
    });
  };

  // If not authenticated, show auth layout
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthLayout onAuthSuccess={login} />;
  }

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile-Responsive Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Stats */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskBoard
              </h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {totalTasks} tasks
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/50"
                />
              </div>
              
              <Button
                onClick={() => handleAddTask('todo')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>
              
              <UserProfile userName={user.name} userEmail={user.email} onLogout={logout} />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-4 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-white/50"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => {
                    handleAddTask('todo');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                
                <UserProfile userName={user.name} userEmail={user.email} onLogout={logout} />
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {totalTasks} tasks
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Mobile Responsive */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Mobile: Stacked Columns, Desktop: Side by side */}
          <div className="flex flex-col lg:flex-row gap-6 lg:overflow-x-auto pb-6">
            {filteredColumns.map((column) => (
              <div key={column.id} className="w-full lg:w-80 lg:flex-shrink-0">
                <TaskColumn
                  column={column}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        status={newTaskStatus}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Index;
