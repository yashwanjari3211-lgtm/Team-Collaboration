import React, { useState } from 'react';
import { X, Calendar, AlignLeft, User, Tag, Clock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateTask } from '../../api/tasks';
import { updateTaskInState } from '../../store/boardSlice';
import Avatar from '../common/Avatar';

export default function TaskModal({ task, onClose }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const handleSaveDescription = async () => {
    setIsEditingDesc(false);
    if (description === task.description) return;
    
    try {
      const res = await updateTask(task.id, { description });
      dispatch(updateTaskInState(res.data));
    } catch (err) {
      console.error('Failed to update task description:', err);
    }
  };

  const priorityColors = {
    low: 'bg-surface-200 text-surface-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-surface-900 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-surface-200 dark:border-surface-800">
          <div className="flex-1 pr-6">
            <span className={`inline-block mb-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityColors[task.priority || 'medium']}`}>
              {task.priority || 'medium'} Priority
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={async () => {
                if (title !== task.title) {
                  const res = await updateTask(task.id, { title });
                  dispatch(updateTaskInState(res.data));
                }
              }}
              className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 -ml-2 text-surface-900 dark:text-white"
            />
            <p className="text-sm text-surface-500 mt-1 pl-1">in list <span className="font-semibold underline cursor-pointer">Backlog</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-surface-700 dark:text-surface-300 font-semibold mb-3">
                <AlignLeft className="w-5 h-5" />
                <h3>Description</h3>
              </div>
              <div className="pl-7">
                {isEditingDesc ? (
                  <div className="space-y-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[120px] p-3 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                      placeholder="Add a more detailed description..."
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveDescription} className="px-4 py-1.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600">
                        Save
                      </button>
                      <button onClick={() => setIsEditingDesc(false)} className="px-4 py-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-sm font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingDesc(true)}
                    className={`min-h-[60px] p-3 rounded-xl cursor-pointer text-sm ${description ? 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/50' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700'}`}
                  >
                    {description || 'Add a more detailed description...'}
                  </div>
                )}
              </div>
            </div>

            {/* Activity (Mocked) */}
            <div>
              <div className="flex items-center justify-between text-surface-700 dark:text-surface-300 font-semibold mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <h3>Activity</h3>
                </div>
                <button className="text-sm bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 px-3 py-1 rounded-lg transition-colors">Show Details</button>
              </div>
              <div className="pl-7 space-y-4">
                {/* Mock Comment */}
                <div className="flex gap-3">
                  <Avatar name="Jane Doe" size="sm" />
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-semibold text-surface-900 dark:text-surface-100">Jane Doe</span> <span className="text-surface-500 text-xs ml-1">2 hours ago</span></p>
                    <div className="mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-3 rounded-xl text-sm text-surface-700 dark:text-surface-300 shadow-sm">
                      We need to make sure this aligns with the new design system.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-48 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Add to card</h4>
              <div className="space-y-1.5">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                  <User className="w-4 h-4" /> Members
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                  <Tag className="w-4 h-4" /> Labels
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                  <Calendar className="w-4 h-4" /> Due Date
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Actions</h4>
              <div className="space-y-1.5">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                  Archive
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
