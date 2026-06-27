import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../api/tasks';
import { addTask } from '../../store/boardSlice';

export default function KanbanColumn({ column, onTaskClick }) {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const activeBoard = useSelector(state => state.boards.activeBoard);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !activeBoard) return;
    try {
      const res = await createTask({
        title: newTaskTitle.trim(),
        board_id: activeBoard.id,
        column_id: column.id,
        order: column.tasks?.length || 0,
        priority: 'medium'
      });
      dispatch(addTask(res.data));
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div className="w-[300px] flex-shrink-0 flex flex-col bg-surface-50 dark:bg-surface-950/50 rounded-xl border border-surface-200 dark:border-surface-800 max-h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{column.name}</h3>
          <span className="bg-surface-100 dark:bg-surface-800 text-surface-500 text-xs font-medium px-2 py-0.5 rounded-full">
            {column.tasks?.length || 0}
          </span>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-surface-400 hover:text-surface-600 transition-colors p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <Droppable droppableId={column.id.toString()}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`min-h-[150px] space-y-3 transition-colors ${
                snapshot.isDraggingOver ? 'bg-brand-50/50 dark:bg-brand-500/5 rounded-xl' : ''
              }`}
            >
              {column.tasks?.map((task, index) => (
                <KanbanCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onClick={() => onTaskClick(task)} 
                />
              ))}
              {provided.placeholder}
              
              {isAdding && (
                <div className="bg-white dark:bg-surface-900 p-3 rounded-xl shadow-sm border border-brand-300 dark:border-brand-500/50 mt-3">
                  <textarea
                    autoFocus
                    className="w-full text-sm bg-transparent border-none focus:outline-none resize-none text-surface-900 dark:text-surface-100 placeholder-surface-400"
                    placeholder="What needs to be done?"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateTask();
                      }
                      if (e.key === 'Escape') setIsAdding(false);
                    }}
                    rows={2}
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                    <button 
                      onClick={handleCreateTask}
                      className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      Add Task
                    </button>
                    <button 
                      onClick={() => {
                        setIsAdding(false);
                        setNewTaskTitle('');
                      }}
                      className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
