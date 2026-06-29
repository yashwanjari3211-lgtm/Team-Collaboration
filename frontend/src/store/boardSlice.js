import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBoards, getBoard, createBoard, updateBoard, deleteBoard, createColumn, updateColumn, deleteColumn } from '../api/boards';
import { getTasks, updateTask, createTask as apiCreateTask } from '../api/tasks';

export const fetchBoards = createAsyncThunk('boards/fetchBoards', async () => {
  const response = await getBoards();
  return response.data;
});

export const createBoardThunk = createAsyncThunk('boards/createBoardThunk', async (boardData) => {
  const response = await createBoard(boardData);
  return response.data;
});

export const fetchBoardDetails = createAsyncThunk('boards/fetchBoardDetails', async (boardId) => {
  const [boardRes, tasksRes] = await Promise.all([
    getBoard(boardId),
    getTasks(boardId)
  ]);
  return { board: boardRes.data, tasks: tasksRes.data };
});

const boardSlice = createSlice({
  name: 'boards',
  initialState: {
    items: [],
    activeBoard: null,
    loading: false,
    error: null,
  },
  reducers: {
    setBoards: (state, action) => {
      state.items = action.payload;
    },
    setActiveBoard: (state, action) => {
      state.activeBoard = action.payload;
    },
    // Optimistic drag and drop reordering
    moveTask: (state, action) => {
      if (!state.activeBoard) return;
      const { taskId, sourceColumnId, destColumnId, sourceIndex, destIndex } = action.payload;
      
      const sourceCol = state.activeBoard.columns.find(c => c.id === sourceColumnId);
      const destCol = state.activeBoard.columns.find(c => c.id === destColumnId);
      
      if (!sourceCol || !destCol) return;
      
      // Ensure tasks arrays exist
      if (!sourceCol.tasks) sourceCol.tasks = [];
      if (!destCol.tasks) destCol.tasks = [];
      
      const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
      if (movedTask) {
        movedTask.column_id = destColumnId;
        destCol.tasks.splice(destIndex, 0, movedTask);
        
        // Update order property for all tasks in destination column
        destCol.tasks.forEach((task, index) => {
          task.order = index;
        });
        
        // Update order property for all tasks in source column if different
        if (sourceColumnId !== destColumnId) {
          sourceCol.tasks.forEach((task, index) => {
            task.order = index;
          });
        }
      }
    },
    addColumn: (state, action) => {
      if (state.activeBoard) {
        const newCol = action.payload;
        newCol.tasks = [];
        state.activeBoard.columns.push(newCol);
      }
    },
    addTask: (state, action) => {
      if (state.activeBoard) {
        const task = action.payload;
        const col = state.activeBoard.columns.find(c => c.id === task.column_id);
        if (col) {
          if (!col.tasks) col.tasks = [];
          col.tasks.push(task);
        }
      }
    },
    updateTaskInState: (state, action) => {
      if (state.activeBoard) {
        const updatedTask = action.payload;
        for (const col of state.activeBoard.columns) {
          if (!col.tasks) continue;
          const idx = col.tasks.findIndex(t => t.id === updatedTask.id);
          if (idx !== -1) {
            // If column changed, remove and add to new
            if (col.id !== updatedTask.column_id) {
              col.tasks.splice(idx, 1);
              const destCol = state.activeBoard.columns.find(c => c.id === updatedTask.column_id);
              if (destCol) {
                if (!destCol.tasks) destCol.tasks = [];
                destCol.tasks.push(updatedTask);
                destCol.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
              }
            } else {
              col.tasks[idx] = updatedTask;
              col.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
            break;
          }
        }
      }
    },
    removeTaskFromState: (state, action) => {
      if (state.activeBoard) {
        const { taskId, columnId } = action.payload;
        const col = state.activeBoard.columns.find(c => c.id === columnId);
        if (col && col.tasks) {
          col.tasks = col.tasks.filter(t => t.id !== taskId);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createBoardThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.activeBoard = action.payload;
      })
      .addCase(fetchBoardDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { board, tasks } = action.payload;
        // Group tasks into columns
        board.columns.forEach(col => {
          col.tasks = tasks.filter(t => t.column_id === col.id).sort((a, b) => a.order - b.order);
        });
        state.activeBoard = board;
      })
      .addCase(fetchBoardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error("fetchBoardDetails failed:", action.error);
      })
      .addCase('channels/setActiveChannel', (state) => {
        state.activeBoard = null;
      })
      .addCase('channels/setActiveDm', (state) => {
        state.activeBoard = null;
      });
  },
});

export const { setBoards, setActiveBoard, moveTask, addColumn, addTask, updateTaskInState, removeTaskFromState } = boardSlice.actions;
export default boardSlice.reducer;

