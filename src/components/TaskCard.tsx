
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, User, Trash2, Check } from 'lucide-react';
import { Task } from '@/types/task';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMarkComplete?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onMarkComplete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const handleMarkComplete = () => {
    if (onMarkComplete && task.status !== 'done') {
      const updatedTask = { ...task, status: 'done' as const, updatedAt: new Date() };
      onMarkComplete(updatedTask);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${task.status === 'done' ? 'opacity-75 bg-green-50' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className={`font-semibold text-sm line-clamp-2 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              {task.status !== 'done' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete();
                  }}
                  className="cursor-pointer text-green-600 hover:text-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="cursor-pointer text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={`text-xs text-muted-foreground mb-3 line-clamp-2 ${task.status === 'done' ? 'line-through' : ''}`}>
          {task.description}
        </p>
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate max-w-16">{task.assignee}</span>
            </div>
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://picsum.photos/24/24?random=${task.id}`} />
              <AvatarFallback className="text-xs">
                {task.assignee.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        {task.status === 'done' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" />
            <span>Completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
