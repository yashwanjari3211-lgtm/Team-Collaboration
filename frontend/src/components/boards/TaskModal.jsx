import React, { useState, useEffect } from 'react';
import { X, Calendar, AlignLeft, User, Tag, Clock, Trash2, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask, getTaskComments, createTaskComment } from '../../api/tasks';
import { getOrgMembers } from '../../api/organizations';
import { updateTaskInState, removeTaskFromState } from '../../store/boardSlice';
import Avatar from '../common/Avatar';

export default function TaskModal({ task, onClose }) {
  const dispatch = useDispatch();
  const activeBoard = useSelector(state => state.boards.activeBoard);
  const currentUser = useSelector(state => state.auth.user);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [members, setMembers] = useState([]);
  
  const [showMembers, setShowMembers] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showDue, setShowDue] = useState(false);
  
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '');
  const [labels, setLabels] = useState(task.labels || '');

  useEffect(() => {
    getOrgMembers().then(res => setMembers(res.data)).catch(console.error);
    getTaskComments(task.id).then(res => setComments(res.data)).catch(console.error);
  }, [task.id]);

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

  const handleAssignMember = async (userId) => {
    try {
      const res = await updateTask(task.id, { assignee_id: userId });
      dispatch(updateTaskInState(res.data));
      setShowMembers(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateDueDate = async (e) => {
    const val = e.target.value;
    setDueDate(val);
    try {
      const res = await updateTask(task.id, { due_date: val ? new Date(val).toISOString() : null });
      dispatch(updateTaskInState(res.data));
      setShowDue(false);
    } catch (err) { console.error(err); }
  };

  const toggleLabel = async (label) => {
    const currentLabels = labels ? labels.split(',') : [];
    let newLabelsArr;
    if (currentLabels.includes(label)) {
      newLabelsArr = currentLabels.filter(l => l !== label);
    } else {
      newLabelsArr = [...currentLabels, label];
    }
    const newLabelsStr = newLabelsArr.join(',');
    setLabels(newLabelsStr);
    try {
      const res = await updateTask(task.id, { labels: newLabelsStr });
      dispatch(updateTaskInState(res.data));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
        dispatch(removeTaskFromState({ taskId: task.id, columnId: task.column_id }));
        onClose();
      } catch(err) { console.error(err); }
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await createTaskComment(task.id, newComment);
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) { console.error(err); }
  };

  const priorityColors = {
    low: 'bg-surface-200 text-surface-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };
  
  const currentColumn = activeBoard?.columns?.find(c => c.id === task.column_id);
  const assignee = members.find(m => m.user.id === task.assignee_id)?.user;
  const AVAILABLE_LABELS = ['UI', 'Bug', 'Feature', 'API', 'Design', 'Urgent'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-surface-900 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        
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
            <p className="text-sm text-surface-500 mt-1 pl-1">in list <span className="font-semibold underline">{currentColumn?.name || 'Unknown'}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Meta Info row (Assignee, Due Date, Labels) */}
            <div className="flex flex-wrap gap-6">
              {assignee && (
                <div>
                  <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Assignee</h4>
                  <div className="flex items-center gap-2">
                    <Avatar name={assignee.name || assignee.email} size="sm" />
                    <span className="text-sm font-medium">{assignee.name || assignee.email.split('@')[0]}</span>
                  </div>
                </div>
              )}
              {dueDate && (
                <div>
                  <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Due Date</h4>
                  <div className="text-sm font-medium px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg">
                    {new Date(dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {labels && (
                <div>
                  <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {labels.split(',').map(l => (
                      <span key={l} className="px-2 py-1 text-xs font-semibold rounded-md bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

            {/* Activity / Comments */}
            <div>
              <div className="flex items-center justify-between text-surface-700 dark:text-surface-300 font-semibold mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <h3>Activity</h3>
                </div>
              </div>
              <div className="pl-7 space-y-4">
                
                {/* Add Comment */}
                <div className="flex gap-3 mb-6">
                  <Avatar name={currentUser?.name || currentUser?.email} size="sm" />
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full min-h-[80px] p-3 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                    />
                    <button 
                      onClick={handlePostComment}
                      disabled={!newComment.trim()}
                      className="self-end px-4 py-1.5 bg-brand-500 disabled:bg-brand-500/50 text-white text-sm font-medium rounded-lg hover:bg-brand-600 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>

                {/* List Comments */}
                {comments.map(comment => {
                  const commentUser = members.find(m => m.user.id === comment.user_id)?.user || { name: 'Unknown', email: 'unknown' };
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar name={commentUser.name || commentUser.email} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-surface-900 dark:text-surface-100">{commentUser.name || commentUser.email.split('@')[0]}</span> 
                          <span className="text-surface-500 text-xs ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                        </p>
                        <div className="mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-3 rounded-xl text-sm text-surface-700 dark:text-surface-300 shadow-sm">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-48 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Add to card</h4>
              <div className="space-y-1.5 relative">
                
                {/* Members Button */}
                <div className="relative">
                  <button onClick={() => setShowMembers(!showMembers)} className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                    <User className="w-4 h-4" /> Members
                  </button>
                  {showMembers && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl z-10 overflow-hidden">
                      {members.map(m => (
                        <button key={m.user.id} onClick={() => handleAssignMember(m.user.id)} className="w-full text-left px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-sm">
                          {m.user.name || m.user.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Labels Button */}
                <div className="relative">
                  <button onClick={() => setShowLabels(!showLabels)} className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                    <Tag className="w-4 h-4" /> Labels
                  </button>
                  {showLabels && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl z-10 p-2 flex flex-wrap gap-1">
                      {AVAILABLE_LABELS.map(l => (
                        <button 
                          key={l} 
                          onClick={() => toggleLabel(l)} 
                          className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${labels?.split(',').includes(l) ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date Button */}
                <div className="relative">
                  <button onClick={() => setShowDue(!showDue)} className="w-full flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg text-sm text-surface-700 dark:text-surface-300 transition-colors">
                    <Calendar className="w-4 h-4" /> Due Date
                  </button>
                  {showDue && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl z-10 p-2">
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={handleUpdateDueDate}
                        className="w-full text-sm p-1 border rounded dark:bg-surface-700 dark:border-surface-600 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Actions</h4>
              <div className="space-y-1.5">
                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors font-medium">
                  <Trash2 className="w-4 h-4" /> Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
