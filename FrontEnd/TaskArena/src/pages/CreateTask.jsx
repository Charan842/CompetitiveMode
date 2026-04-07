import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTask } from '../services/taskService';
import { getMatch } from '../services/matchService';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import TemplateSelector from '../components/TemplateSelector';
import ConstraintBanner from '../components/ConstraintBanner';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSend, FiArrowLeft, FiFileText, FiCode, FiLink, FiUpload } from 'react-icons/fi';

const emptySubtask = { title: '', type: 'text', resourceLink: '', instructions: '' };

const typeInfo = {
  text: { icon: FiFileText, label: 'Text', color: 'text-blue-400' },
  code: { icon: FiCode, label: 'Code', color: 'text-violet-400' },
  link: { icon: FiLink, label: 'Link', color: 'text-emerald-400' },
  file: { icon: FiUpload, label: 'File', color: 'text-orange-400' },
};

const CreateTask = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'DSA',
    difficulty: 'Medium',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
  });

  const [subtasks, setSubtasks] = useState([{ ...emptySubtask }]);

  useEffect(() => {
    getMatch(matchId).then((res) => setMatchData(res.data)).catch(() => {});
  }, [matchId]);

  const updateForm = (field, value) => setForm({ ...form, [field]: value });
  const addSubtask = () => setSubtasks([...subtasks, { ...emptySubtask }]);

  const removeSubtask = (index) => {
    if (subtasks.length === 1) return toast.error('At least one subtask is required');
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index, field, value) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubtasks(updated);
  };

  const handleTemplateSelect = (templateSubtasks, category) => {
    setSubtasks(templateSubtasks);
    setForm((prev) => ({ ...prev, category }));
    toast.success(`${category} template loaded!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateStr = form.date;
    const startTime = new Date(`${dateStr}T${form.startTime}`).toISOString();
    const endTime = new Date(`${dateStr}T${form.endTime}`).toISOString();

    setLoading(true);
    try {
      const { data } = await createTask({
        matchId, title: form.title, description: form.description,
        category: form.category, difficulty: form.difficulty,
        date: dateStr, startTime, endTime, subtasks,
      });
      toast.success('Task created! Game on!');
      navigate(`/task/${data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full futuristic-input rounded-lg px-3 sm:px-4 py-2.5 text-white text-sm";

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#080303' }}>
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-red-400 text-sm mb-4 sm:mb-6 transition-colors cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft size={14} /> Back
          </button>

          <h1 className="display-title text-xl sm:text-2xl text-white mb-4 sm:mb-5">Create Task</h1>

          {/* Constraint Banner */}
          {matchData?.nextConstraint && (
            <div className="mb-5">
              <ConstraintBanner constraintText={matchData.nextConstraint} type="active" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Basic Info */}
            <AnimatedCard>
              <div className="glass-panel rounded-xl p-4 sm:p-6 space-y-4">
                <h2 className="text-white font-semibold text-sm sm:text-base">Task Details</h2>

                <div>
                  <label className="block text-slate-500 text-xs sm:text-sm mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g., Binary Search Challenge" required className={inputCls} />
                </div>

                <div>
                  <label className="block text-slate-500 text-xs sm:text-sm mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe the task..." required rows={3}
                    className={`${inputCls} resize-y`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-slate-500 text-xs sm:text-sm mb-1">Category</label>
                    <select value={form.category} onChange={(e) => updateForm('category', e.target.value)} className={inputCls}>
                      <option value="DSA">DSA</option>
                      <option value="Study">Study</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs sm:text-sm mb-1">Difficulty</label>
                    <select value={form.difficulty} onChange={(e) => updateForm('difficulty', e.target.value)} className={inputCls}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs sm:text-sm mb-1">Date</label>
                    <input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)}
                      required className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-slate-500 text-xs sm:text-sm mb-1">Start Time</label>
                    <input type="time" value={form.startTime} onChange={(e) => updateForm('startTime', e.target.value)}
                      required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs sm:text-sm mb-1">End Time</label>
                    <input type="time" value={form.endTime} onChange={(e) => updateForm('endTime', e.target.value)}
                      required className={inputCls} />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Subtasks */}
            <AnimatedCard delay={150}>
              <div className="glass-panel rounded-xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-white font-semibold text-sm sm:text-base">
                    Subtasks
                    <span className="hud-pill ml-2">{subtasks.length}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <TemplateSelector onSelect={handleTemplateSelect} />
                    <button type="button" onClick={addSubtask}
                      className="flex items-center gap-1 text-red-400 text-xs sm:text-sm hover:text-red-300 cursor-pointer transition-colors bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1.5 rounded-lg">
                      <FiPlus size={13} /> Add
                    </button>
                  </div>
                </div>

                {subtasks.map((st, i) => {
                  const info = typeInfo[st.type];
                  const Icon = info.icon;
                  return (
                    <div key={i} className="glass-panel rounded-xl p-3 sm:p-4 space-y-3 hover:border-red-500/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-black/40 ${info.color}`}>
                            <Icon size={13} />
                          </div>
                          <span className="text-slate-600 text-xs font-mono">#{i + 1}</span>
                        </div>
                        <button type="button" onClick={() => removeSubtask(i)}
                          className="text-red-500/40 hover:text-red-400 cursor-pointer transition-colors p-1 hover:bg-red-400/10 rounded">
                          <FiTrash2 size={13} />
                        </button>
                      </div>

                      <input type="text" value={st.title} onChange={(e) => updateSubtask(i, 'title', e.target.value)}
                        placeholder="Subtask title" required
                        className="w-full futuristic-input rounded-lg px-3 py-2 text-white text-sm" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select value={st.type} onChange={(e) => updateSubtask(i, 'type', e.target.value)}
                          className="futuristic-input rounded-lg px-3 py-2 text-white text-sm">
                          <option value="text">Text</option>
                          <option value="code">Code</option>
                          <option value="link">Link</option>
                          <option value="file">File</option>
                          <option value="image">Image</option>
                        </select>
                        <input type="text" value={st.resourceLink} onChange={(e) => updateSubtask(i, 'resourceLink', e.target.value)}
                          placeholder="Resource link (optional)"
                          className="futuristic-input rounded-lg px-3 py-2 text-white text-sm" />
                      </div>

                      <textarea value={st.instructions} onChange={(e) => updateSubtask(i, 'instructions', e.target.value)}
                        placeholder="Instructions for this subtask..." required rows={2}
                        className="w-full futuristic-input rounded-lg px-3 py-2 text-white text-sm resize-y" />
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={250}>
              <button type="submit" disabled={loading}
                className="neon-button w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99] text-sm sm:text-base">
                <FiSend size={16} />
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </AnimatedCard>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default CreateTask;
