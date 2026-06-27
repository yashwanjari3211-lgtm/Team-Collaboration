import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { updateTask, reorderTasks } from '../../api/tasks';
import { fetchBoardDetails, moveTask } from '../../store/boardSlice';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';

export default function BoardView() {
  const dispatch = useDispatch();
  const activeBoard = useSelector(state => state.boards.activeBoard);
  const loading = useSelector(state => state.boards.loading);
  const error = useSelector(state => state.boards.error);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  useEffect(() => {
    if (activeBoard?.id) {
      dispatch(fetchBoardDetails(activeBoard.id));
    }
  }, [activeBoard?.id, dispatch]);

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !activeBoard) return;
    try {
      const res = await dispatch(addColumn({ 
        boardId: activeBoard.id, 
        name: newColumnName.trim() 
      })).unwrap();
      setNewColumnName('');
      setIsCreatingColumn(false);
    } catch (err) {
      console.error('Failed to create column:', err);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const parsedTaskId = parseInt(draggableId);
    const sourceColId = parseInt(source.droppableId);
    const destColId = parseInt(destination.droppableId);

    // Deep copy columns to calculate new order before dispatching
    // Alternatively, we can just dispatch optimistic update, then read state from store?
    // Wait, reading state from store inside a component is tricky if we don't have access to the latest state synchronously.
    // Let's just calculate the new order here manually to send to the backend.
    
    const sourceCol = activeBoard.columns.find(c => c.id === sourceColId);
    const destCol = activeBoard.columns.find(c => c.id === destColId);
    if (!sourceCol || !destCol) return;

    // Optimistic UI update
    dispatch(moveTask({
      taskId: parsedTaskId,
      sourceColumnId: sourceColId,
      destColumnId: destColId,
      sourceIndex: source.index,
      destIndex: destination.index
    }));

    // Calculate new order for backend
    try {
      const updates = [];
      const newSourceTasks = [...(sourceCol.tasks || [])];
      const newDestTasks = sourceColId === destColId ? newSourceTasks : [...(destCol.tasks || [])];

      const [movedTask] = newSourceTasks.splice(source.index, 1);
      newDestTasks.splice(destination.index, 0, movedTask);

      newDestTasks.forEach((t, idx) => {
        updates.push({ id: t.id, column_id: destColId, order: idx });
      });

      if (sourceColId !== destColId) {
        newSourceTasks.forEach((t, idx) => {
          updates.push({ id: t.id, column_id: sourceColId, order: idx });
        });
      }

      await reorderTasks(updates);
    } catch (err) {
      console.error('Failed to update task positions:', err);
      // Revert could be added here if needed
    }
  };

  if (loading || !activeBoard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        {error && (
          <div className="text-red-500 text-sm">Error: {error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-surface-200 dark:border-surface-800 px-6 flex items-center justify-between bg-white dark:bg-surface-900">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-white">{activeBoard.name}</h1>
          {activeBoard.description && (
            <p className="text-sm text-surface-500">{activeBoard.description}</p>
          )}
        </div>
      </header>

      {/* Board Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex items-start h-full gap-6">
            {activeBoard.columns.map((column) => (
              <KanbanColumn 
                key={column.id} 
                column={column} 
                onTaskClick={setSelectedTask} 
              />
            ))}
            
            {/* Add Column Button */}
            <button className="flex-shrink-0 w-80 h-12 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-brand-500 dark:hover:border-brand-500 flex items-center justify-center text-surface-500 hover:text-brand-600 transition-colors">
              <span className="font-medium">+ Add Column</span>
            </button>
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
