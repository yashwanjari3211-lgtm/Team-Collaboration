import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { updateTask } from '../../api/tasks';
import { fetchBoardDetails, moveTask } from '../../store/boardSlice';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';

export default function BoardView() {
  const dispatch = useDispatch();
  const activeBoard = useSelector(state => state.boards.activeBoard);
  const loading = useSelector(state => state.boards.loading);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (activeBoard?.id) {
      dispatch(fetchBoardDetails(activeBoard.id));
    }
  }, [activeBoard?.id, dispatch]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumnId = parseInt(source.droppableId);
    const destColumnId = parseInt(destination.droppableId);
    const taskId = parseInt(draggableId);

    // Optimistically update the UI
    dispatch(moveTask({
      taskId,
      sourceColumnId,
      destColumnId,
      sourceIndex: source.index,
      destIndex: destination.index
    }));

    // Send API request
    try {
      await updateTask(taskId, {
        column_id: destColumnId,
        order: destination.index
      });
    } catch (err) {
      console.error('Failed to move task:', err);
      // Ideally rollback optimistic update here
    }
  };

  if (loading || !activeBoard) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
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
