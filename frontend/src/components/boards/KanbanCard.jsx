import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, Paperclip, MoreHorizontal } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useSelector } from 'react-redux';

export default function KanbanCard({ task, index, onClick }) {
  const users = useSelector(state => state.auth.user ? [state.auth.user] : []); // Mock users for assignee
  const assignee = null; // Mock assignee for now

  const priorityColors = {
    low: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white dark:bg-surface-900 p-4 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 group cursor-pointer transition-all hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/50 ${
            snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 z-50 ring-2 ring-brand-500' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityColors[task.priority || 'medium']}`}>
              {task.priority || 'medium'}
            </span>
            <button className="text-surface-400 hover:text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 leading-snug mb-3">
            {task.title}
          </h4>
          
          {task.description && (
            <p className="text-xs text-surface-500 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-3 text-surface-400">
              {task.due_date && (
                <div className="flex items-center gap-1 text-[11px]" title="Due Date">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Badges for comments/attachments (Mocked for UI) */}
              <div className="flex items-center gap-1 text-[10px] text-surface-400">
                <MessageSquare className="w-3 h-3" /> 2
              </div>
              <div className="flex items-center gap-1 text-[10px] text-surface-400">
                <Paperclip className="w-3 h-3" /> 1
              </div>
              
              {/* Assignee Avatar */}
              <div className="ml-2">
                <Avatar name={assignee?.full_name || 'Unassigned'} src={assignee?.avatar} size="xs" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
