import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTask } from '../services/taskService';
import { getMatch } from '../services/matchService';
import { getTasksByMatch } from '../services/taskService';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import TemplateSelector from '../components/TemplateSelector';
import ConstraintBanner from '../components/ConstraintBanner';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSend, FiArrowLeft, FiFileText, FiCode, FiLink, FiUpload } from 'react-icons/fi';

const emptySubtask = { title: '', type: 'text', resourceLink: '', instructions: '' };
const MAX_QUESTIONS = 20;

const buildDSASubtasks = (count, existingSubtasks = []) =>
  Array.from({ length: count }, (_, index) => {
    const existing = existingSubtasks[index] || {};
    return {
      title: existing.title || `Question ${index + 1}`,
      type: existing.type || 'code',
      resourceLink: existing.resourceLink || '',
      instructions:
        existing.instructions ||
        `Solve DSA question ${index + 1}. Keep this subtask limited to one question only.`,
    };
  });

const typeInfo = {
  text: { icon: FiFileText, label: 'Text', color: 'text-blue-400' },
  code: { icon: FiCode, label: 'Code', color: 'text-purple-400' },
  link: { icon: FiLink, label: 'Link', color: 'text-green-400' },
  file: { icon: FiUpload, label: 'File', color: 'text-orange-400' },
};

const CreateTask = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);

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
    Promise.all([getMatch(matchId), getTasksByMatch(matchId)])
      .then(([matchRes, tasksRes]) => {
        setMatchData(matchRes.data);
        setTaskCount(tasksRes.data.length);
      })
      .catch(() => {});
  }, [matchId]);

  useEffect(() => {
    if (form.category !== 'DSA') return;
    setSubtasks((prev) => buildDSASubtasks(questionCount, prev));
  }, [form.category, questionCount]);

  const handleTemplateSelect = (templateSubtasks, category) => {
    setSubtasks(templateSubtasks);
    if (category === 'DSA') {
      setQuestionCount(templateSubtasks.length || 1);
    }
    setForm((prev) => ({ ...prev, category }));
    toast.success(`${category} template loaded!`);
  };

  const updateForm = (field, value) => {
    if (field === 'category') {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (value === 'DSA') {
        setSubtasks((prev) => buildDSASubtasks(questionCount, prev));
      }
      return;
    }
    setForm({ ...form, [field]: value });
  };

  const addSubtask = () => {
    if (form.category === 'DSA') {
      if (questionCount >= MAX_QUESTIONS) {
        return toast.error(`You can add up to ${MAX_QUESTIONS} DSA questions in one task`);
      }
      setQuestionCount((prev) => prev + 1);
      return;
    }
    setSubtasks([...subtasks, { ...emptySubtask }]);
  };

  const removeSubtask = (index) => {
    if (subtasks.length === 1) return toast.error('At least one subtask is required');
    if (form.category === 'DSA') {
      setQuestionCount((prev) => prev - 1);
      return;
    }
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index, field, value) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubtasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (taskCount >= 5) {
      toast.error('This match already has 5 tasks');
      return;
    }

    const dateStr = form.date;
    const startTime = new Date(`${dateStr}T${form.startTime}`).toISOString();
    const endTime = new Date(`${dateStr}T${form.endTime}`).toISOString();

    setLoading(true);
    try {
      const { data } = await createTask({
        matchId,
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        date: dateStr,
        startTime,
        endTime,
        subtasks,
      });
      toast.success('Task created! Game on!');
      navigate(`/task/${data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const TypeIcon = typeInfo[subtasks[0]?.type]?.icon || FiFileText;
  const hasReachedTaskLimit = taskCount >= 5;

  return (
    <PageTransition>
      <div className="app-shell">
        <div className="page-content max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-cyan-200 text-sm mb-4 sm:mb-6 transition-colors cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft size={14} /> Back
          </button>

          <div className="glass-panel-strong rounded-[28px] p-5 sm:p-6 mb-5 scan-line">
            <span className="eyebrow mb-4">Task Forge</span>
            <h1 className="display-title text-2xl sm:text-3xl text-white">Create Task</h1>
            <p className="text-slate-400 text-sm mt-2">
              Build a challenge that feels deliberate, competitive, and clear for both players.
            </p>
          </div>

          {hasReachedTaskLimit && (
            <div className="mb-5 danger-button rounded-2xl p-4">
              <p className="text-red-300 text-sm">
                This match has already reached its maximum of 5 tasks. Dispose the match or create a new one to continue.
              </p>
            </div>
          )}

          {/* Constraint Banner */}
          {matchData?.nextConstraint && (
            <div className="mb-5">
              <ConstraintBanner constraintText={matchData.nextConstraint} type="active" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Basic Info */}
            <AnimatedCard>
              <div className="glass-panel rounded-[24px] p-4 sm:p-6 space-y-4">
                <h2 className="text-white font-semibold text-sm sm:text-base">Task Details</h2>

                <div>
                  <label className="block text-gray-400 text-xs sm:text-sm mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g., Binary Search Challenge"
                    required
                    className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs sm:text-sm mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe the task..."
                    required
                    rows={3}
                    className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs sm:text-sm mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => updateForm('category', e.target.value)}
                      className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                    >
                      <option value="DSA">DSA</option>
                      <option value="Study">Study</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs sm:text-sm mb-1">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => updateForm('difficulty', e.target.value)}
                      className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs sm:text-sm mb-1">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                      required
                      className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs sm:text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => updateForm('startTime', e.target.value)}
                      required
                      className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs sm:text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => updateForm('endTime', e.target.value)}
                      required
                      className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                </div>

                {form.category === 'DSA' && (
                  <div>
                    <label className="block text-gray-400 text-xs sm:text-sm mb-1">Number of Questions</label>
                    <input
                      type="number"
                      min="1"
                      max={MAX_QUESTIONS}
                      value={questionCount}
                      onChange={(e) => {
                        const nextValue = Number(e.target.value);
                        if (!Number.isFinite(nextValue)) return;
                        const clampedValue = Math.min(MAX_QUESTIONS, Math.max(1, nextValue));
                        setQuestionCount(clampedValue);
                      }}
                      className="futuristic-input w-full rounded-xl px-3 sm:px-4 py-2.5 text-white text-sm"
                    />
                    <p className="text-slate-500 text-xs mt-2">Each DSA question becomes one subtask.</p>
                  </div>
                )}
              </div>
            </AnimatedCard>

            {/* Subtasks */}
            <AnimatedCard delay={150}>
              <div className="glass-panel rounded-[24px] p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-white font-semibold text-sm sm:text-base">
                    {form.category === 'DSA' ? 'Questions' : 'Subtasks'}
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full ml-2">{subtasks.length}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <TemplateSelector onSelect={handleTemplateSelect} />
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="ghost-button flex items-center gap-1 text-xs sm:text-sm cursor-pointer px-2.5 py-1.5 rounded-xl"
                    >
                      <FiPlus size={13} />
                      {form.category === 'DSA' ? 'Add Question' : 'Add'}
                    </button>
                  </div>
                </div>

                {subtasks.map((st, i) => {
                  const info = typeInfo[st.type];
                  const Icon = info.icon;
                  return (
                    <div key={i} className="metric-tile rounded-2xl p-3 sm:p-4 space-y-3 hover:border-cyan-400/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-slate-900/80 ${info.color}`}>
                            <Icon size={13} />
                          </div>
                          <span className="text-slate-500 text-xs font-mono">
                            {form.category === 'DSA' ? `Q${i + 1}` : `#${i + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubtask(i)}
                          className="text-red-400/60 hover:text-red-400 cursor-pointer transition-colors p-1 hover:bg-red-400/10 rounded"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => updateSubtask(i, 'title', e.target.value)}
                        placeholder={form.category === 'DSA' ? 'Question title' : 'Subtask title'}
                        required
                        className="futuristic-input w-full rounded-xl px-3 py-2 text-white text-sm"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={st.type}
                          onChange={(e) => updateSubtask(i, 'type', e.target.value)}
                          className="futuristic-input rounded-xl px-3 py-2 text-white text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="code">Code</option>
                          <option value="link">Link</option>
                          <option value="file">File</option>
                        </select>

                        <input
                          type="text"
                          value={st.resourceLink}
                          onChange={(e) => updateSubtask(i, 'resourceLink', e.target.value)}
                          placeholder={form.category === 'DSA' ? 'Problem link (optional)' : 'Resource link (optional)'}
                          className="futuristic-input rounded-xl px-3 py-2 text-white text-sm"
                        />
                      </div>

                      <textarea
                        value={st.instructions}
                        onChange={(e) => updateSubtask(i, 'instructions', e.target.value)}
                        placeholder={form.category === 'DSA' ? 'Describe this question...' : 'Instructions for this subtask...'}
                        required
                        rows={2}
                        className="futuristic-input w-full rounded-xl px-3 py-2 text-white text-sm resize-y"
                      />
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={250}>
              <button
                type="submit"
                disabled={loading || hasReachedTaskLimit}
                className="neon-button w-full flex items-center justify-center gap-2 font-bold py-3 rounded-2xl transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99] text-sm sm:text-base"
              >
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
