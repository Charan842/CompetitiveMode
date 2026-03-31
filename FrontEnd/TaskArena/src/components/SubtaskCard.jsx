import { FiFileText, FiLink, FiCode, FiUpload, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

const typeIcons = {
  text: FiFileText,
  link: FiLink,
  code: FiCode,
  file: FiUpload,
};

const typeColors = {
  text: 'text-blue-400',
  link: 'text-emerald-400',
  code: 'text-violet-400',
  file: 'text-orange-400',
};

const typeBg = {
  text: 'bg-blue-400/10',
  link: 'bg-emerald-400/10',
  code: 'bg-violet-400/10',
  file: 'bg-orange-400/10',
};

const ensureAbsolute = (url) => {
  if (!url) return url;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
};

const SubtaskCard = ({ subtask, index, isCompleted, onClick }) => {
  const Icon = typeIcons[subtask.type] || FiFileText;

  return (
    <div
      onClick={onClick}
      className={`group glass-panel rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        isCompleted
          ? 'border-emerald-500/30 bg-emerald-950/20 hover:shadow-emerald-500/5'
          : 'hover:border-red-500/30 hover:shadow-red-500/5'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeBg[subtask.type]} shrink-0`}>
            <Icon className={typeColors[subtask.type]} size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs font-mono">#{index + 1}</span>
              <h4 className="text-white font-medium text-sm group-hover:text-red-300 transition-colors">
                {subtask.title}
              </h4>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25">
              <FiCheckCircle size={12} />
              Done
            </span>
          )}
          <FiChevronRight className="text-slate-600 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" size={14} />
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-1 ml-[42px] line-clamp-2">{subtask.instructions}</p>

      <div className="flex items-center gap-2 mt-2.5 ml-[42px]">
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${typeBg[subtask.type]} ${typeColors[subtask.type]}`}>
          {subtask.type}
        </span>
        {subtask.resourceLink && (
          <a
            href={ensureAbsolute(subtask.resourceLink)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400/70 text-xs hover:text-red-300 hover:underline transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View Resource
          </a>
        )}
      </div>
    </div>
  );
};

export default SubtaskCard;
