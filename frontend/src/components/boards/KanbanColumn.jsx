import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../api/tasks';
import { addTask } from '../../store/boardSlice';

export default function KanbanColumn({ column, onTaskClick }) {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const activeBoard = useSelector(state => state.boards.activeBoard);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      return;
    }

    try {
      const res = await createTask({
        title: newTaskTitle,
        board_id: activeBoard.id,
        column_id: column.id,
        priority: 'medium',
        order: column.tasks ? column.tasks.length : 0
      });
      dispatch(addTask(res.data));
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-surface-100 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-800 max-h-full">
      <div className="p-4 flex items-center justify-between border-b border-surface-200 dark:border-surface-800">
        <h3 className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          {column.name}
          <span className="bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs px-2 py-0.5 rounded-full">
            {column.tasks?.length || 0}
          </span>
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 transition-colors"
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
            </div>
          )}
        </Droppable>

        {isAdding && (
          <form onSubmit={handleAddTask} className="mt-3 bg-white dark:bg-surface-900 p-3 rounded-xl shadow-sm border border-brand-200 dark:border-brand-500/30">
            <input
              autoFocus
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-transparent text-sm focus:outline-none mb-2"
              onBlur={handleAddTask}
            />
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600">
                Add
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-surface-500 hover:text-surface-700 text-xs font-medium">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
