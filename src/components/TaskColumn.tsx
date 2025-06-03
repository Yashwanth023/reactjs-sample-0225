
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { Task, Column } from '@/types/task';

interface TaskColumnProps {
  column: Column;
  onAddTask: (status: 'todo' | 'inProgress' | 'done') => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMarkComplete?: (task: Task) => void;
}

export function TaskColumn({ column, onAddTask, onEditTask, onDeleteTask, onMarkComplete }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const statusColors = {
    todo: 'border-t-blue-500 bg-gradient-to-b from-blue-50 to-white',
    inProgress: 'border-t-yellow-500 bg-gradient-to-b from-yellow-50 to-white',
    done: 'border-t-green-500 bg-gradient-to-b from-green-50 to-white',
  };

  const statusIcons = {
    todo: '📋',
    inProgress: '⚡',
    done: '✅',
  };

  return (
    <Card className={`w-80 h-fit border-t-4 ${statusColors[column.status]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span>{statusIcons[column.status]}</span>
            {column.title}
            <span className="text-sm font-normal text-muted-foreground">
              ({column.tasks.length})
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(column.status)}
            className="h-8 w-8 p-0 hover:bg-white/80"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[200px] pb-4"
        >
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onMarkComplete={onMarkComplete}
              />
            ))}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}
