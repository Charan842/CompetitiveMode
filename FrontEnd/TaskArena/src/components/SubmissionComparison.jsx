import { useState, useEffect } from 'react';
import { getAllSubmissions } from '../services/taskService';
import { FiClock, FiZap, FiUser, FiUsers, FiX, FiMaximize2, FiDownload, FiFileText, FiLink, FiCode, FiUpload, FiImage } from 'react-icons/fi';

const ensureAbsolute = (url) => {
  if (!url) return url;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
};

function downloadFile(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function formatTs(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function ImageModal({ src, filename, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); downloadFile(src, filename); }}
          className="text-white/60 hover:text-white bg-black/40 rounded-full p-2 cursor-pointer border-none"
          title="Download"
        >
          <FiDownload size={18} />
        </button>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white bg-black/40 rounded-full p-2 cursor-pointer border-none"
        >
          <FiX size={20} />
        </button>
      </div>
      <img
        src={src}
        alt="Full view"
        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ResponseBlock({ response, subtaskType, submittedAt, isFaster, isWinner, label }) {
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const hasContent = response && (response.text || response.code || response.fileUrl);
  const filename = `submission-${label || 'proof'}-${submittedAt ? new Date(submittedAt).getTime() : Date.now()}`;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg bg-black/40 border border-dashed border-slate-700/40">
        <p className="text-slate-600 text-xs">No submission</p>
      </div>
    );
  }

  const isImageFile = response?.fileUrl?.startsWith('data:image');

  return (
    <>
      {modalOpen && isImageFile && (
        <ImageModal src={response.fileUrl} filename={filename + '.jpg'} onClose={() => setModalOpen(false)} />
      )}

      <div className={`rounded-xl overflow-hidden border transition-all ${
        isFaster ? 'border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'border-slate-800/50'
      }`}>
        {/* Top bar */}
        <div className={`flex items-center justify-between px-3 py-1.5 text-xs ${
          isFaster ? 'bg-emerald-950/40' : 'bg-black/50'
        }`}>
          <div className="flex items-center gap-2">
            {isFaster && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <FiZap size={10} /> Faster
              </span>
            )}
            {isWinner && <span className="text-red-400 font-bold">🏆</span>}
          </div>
          {submittedAt && (
            <span className="flex items-center gap-1 text-slate-600">
              <FiClock size={10} />
              {formatTs(submittedAt)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="bg-black/60 p-3">
          {(subtaskType === 'text') && response.text && (
            <p className="text-slate-300 text-sm whitespace-pre-wrap break-words leading-relaxed max-h-40 overflow-auto">
              {response.text}
            </p>
          )}

          {subtaskType === 'link' && response.text && (
            <a
              href={ensureAbsolute(response.text)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:underline text-sm break-all flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FiLink size={12} />
              {response.text}
            </a>
          )}

          {subtaskType === 'code' && response.code && (
            <pre className="text-emerald-300 text-xs font-mono whitespace-pre-wrap break-words bg-black/50 p-2.5 rounded-lg max-h-48 overflow-auto border border-violet-900/20">
              {response.code}
            </pre>
          )}

          {(subtaskType === 'file' || subtaskType === 'image') && response.fileUrl && (
            imgError ? (
              <div className="flex flex-col items-center justify-center h-20 gap-2 text-slate-600">
                <FiUpload size={18} />
                <span className="text-xs">File unavailable</span>
              </div>
            ) : isImageFile ? (
              <div className="space-y-1.5">
                <div className="relative group cursor-zoom-in" onClick={() => setModalOpen(true)}>
                  <img
                    src={response.fileUrl}
                    alt="Submission file"
                    className="w-full rounded-lg object-contain max-h-52"
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                    <FiMaximize2 className="text-white" size={20} />
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(response.fileUrl, filename + '.jpg')}
                  className="w-full flex items-center justify-center gap-1.5 text-[10px] text-slate-600 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none py-0.5"
                >
                  <FiDownload size={11} /> Download
                </button>
              </div>
            ) : (
              <button
                onClick={() => downloadFile(response.fileUrl, filename)}
                className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer bg-black/40 hover:bg-black/60 border border-slate-800/60 px-3 py-2.5 rounded-lg"
              >
                <FiDownload size={12} /> Download File
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}

export default function SubmissionComparison({ taskId, currentUserId, result }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mine');

  useEffect(() => {
    if (!taskId || !result) { setLoading(false); return; }
    getAllSubmissions(taskId)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [taskId, result]);

  if (!result) return null;

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 mt-4 animate-pulse space-y-3">
        <div className="h-5 w-40 bg-red-950/40 rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-40 bg-red-950/30 rounded-xl" />
          <div className="h-40 bg-red-950/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data || !data.playerSubmissions || data.playerSubmissions.length === 0) return null;

  const me = data.playerSubmissions.find(
    (p) => p.user._id === currentUserId || p.user._id?.toString() === currentUserId?.toString()
  );
  const opponent = data.playerSubmissions.find(
    (p) => p.user._id !== currentUserId && p.user._id?.toString() !== currentUserId?.toString()
  );

  const myMap = {};
  const opMap = {};
  (me?.submissions || []).forEach((s) => { myMap[s.subtaskId?.toString()] = s; });
  (opponent?.submissions || []).forEach((s) => { opMap[s.subtaskId?.toString()] = s; });

  const subtasks = data.subtasks || [];
  const winnerId = result.winner?._id || result.winner;
  const isIWinner = winnerId && (winnerId === currentUserId || winnerId?.toString() === currentUserId?.toString());

  const tabBtn = (tab, label, Icon) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        activeTab === tab
          ? 'bg-red-600/20 border border-red-500/30 text-red-300'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  const typeIcon = (type) => {
    const icons = { text: FiFileText, link: FiLink, code: FiCode, file: FiUpload, image: FiImage };
    return icons[type] || FiFileText;
  };

  return (
    <div className="mt-6 space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FiFileText className="text-red-400" size={16} />
          Submission Review
        </h3>
        {/* Mobile tab switcher */}
        <div className="flex items-center gap-2 sm:hidden">
          {tabBtn('mine', 'Mine', FiUser)}
          {tabBtn('opponent', "Opponent's", FiUsers)}
          {tabBtn('compare', 'Compare', FiZap)}
        </div>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden sm:block space-y-5">
        {subtasks.map((subtask, idx) => {
          const stId = subtask._id?.toString();
          const mySub = myMap[stId];
          const opSub = opMap[stId];
          const myTime = mySub?.submittedAt ? new Date(mySub.submittedAt).getTime() : null;
          const opTime = opSub?.submittedAt ? new Date(opSub.submittedAt).getTime() : null;
          const myFaster = myTime && opTime ? myTime < opTime : false;
          const opFaster = myTime && opTime ? opTime < myTime : false;
          const SubIcon = typeIcon(subtask.type);

          return (
            <div key={stId || idx} className="glass-panel rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 border-b border-red-900/20">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center">
                  <SubIcon className="text-red-400" size={13} />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-mono mr-2">#{idx + 1}</span>
                  <span className="text-white font-medium text-sm">{subtask.title}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 divide-x divide-red-900/20">
                <div className="p-3">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                    <FiUser size={11} />
                    You {isIWinner && <span className="text-red-400">🏆</span>}
                  </p>
                  <ResponseBlock
                    response={mySub?.response}
                    subtaskType={subtask.type}
                    submittedAt={mySub?.submittedAt}
                    isFaster={myFaster}
                    isWinner={isIWinner}
                    label="mine"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                    <FiUsers size={11} />
                    {opponent?.user?.username || 'Opponent'} {!isIWinner && winnerId && <span className="text-red-400">🏆</span>}
                  </p>
                  <ResponseBlock
                    response={opSub?.response}
                    subtaskType={subtask.type}
                    submittedAt={opSub?.submittedAt}
                    isFaster={opFaster}
                    isWinner={!isIWinner && !!winnerId}
                    label={opponent?.user?.username || 'opponent'}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: tabs */}
      <div className="sm:hidden space-y-4">
        <div className="flex gap-2">
          {tabBtn('mine', 'Mine', FiUser)}
          {tabBtn('opponent', "Opponent's", FiUsers)}
          {tabBtn('compare', 'Side by Side', FiZap)}
        </div>

        {subtasks.map((subtask, idx) => {
          const stId = subtask._id?.toString();
          const mySub = myMap[stId];
          const opSub = opMap[stId];
          const myTime = mySub?.submittedAt ? new Date(mySub.submittedAt).getTime() : null;
          const opTime = opSub?.submittedAt ? new Date(opSub.submittedAt).getTime() : null;
          const myFaster = myTime && opTime ? myTime < opTime : false;
          const opFaster = myTime && opTime ? opTime < myTime : false;
          const SubIcon = typeIcon(subtask.type);

          return (
            <div key={stId || idx} className="glass-panel rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 border-b border-red-900/20">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center">
                  <SubIcon className="text-red-400" size={13} />
                </div>
                <span className="text-white font-medium text-sm">{subtask.title}</span>
              </div>

              <div className="p-3 space-y-3">
                {(activeTab === 'mine' || activeTab === 'compare') && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1"><FiUser size={11} /> You</p>
                    <ResponseBlock response={mySub?.response} subtaskType={subtask.type} submittedAt={mySub?.submittedAt} isFaster={myFaster} isWinner={isIWinner} label="mine" />
                  </div>
                )}
                {(activeTab === 'opponent' || activeTab === 'compare') && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                      <FiUsers size={11} /> {opponent?.user?.username || 'Opponent'}
                    </p>
                    <ResponseBlock response={opSub?.response} subtaskType={subtask.type} submittedAt={opSub?.submittedAt} isFaster={opFaster} isWinner={!isIWinner && !!winnerId} label={opponent?.user?.username || 'opponent'} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
