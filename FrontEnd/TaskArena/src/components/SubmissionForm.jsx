import { useState, useRef } from 'react';
import { FiSend, FiCheckCircle, FiFileText, FiCode, FiLink, FiUpload, FiX, FiFile } from 'react-icons/fi';
import { uploadFile } from '../services/uploadService';
import toast from 'react-hot-toast';

const typeConfig = {
  text: { icon: FiFileText, color: 'text-blue-400', borderFocus: 'focus:border-blue-500', label: 'Text Response' },
  code: { icon: FiCode, color: 'text-purple-400', borderFocus: 'focus:border-purple-500', label: 'Code Response' },
  link: { icon: FiLink, color: 'text-green-400', borderFocus: 'focus:border-green-500', label: 'Link Response' },
  file: { icon: FiUpload, color: 'text-orange-400', borderFocus: 'focus:border-orange-500', label: 'File Upload' },
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SubmissionForm = ({ subtask, onSubmit, existingResponse, disabled }) => {
  const [response, setResponse] = useState({
    text: existingResponse?.text || '',
    code: existingResponse?.code || '',
    fileUrl: existingResponse?.fileUrl || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const config = typeConfig[subtask.type] || typeConfig.text;
  const Icon = config.icon;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      const data = await uploadFile(file);
      setResponse((prev) => ({ ...prev, fileUrl: data.fileUrl }));
      toast.success(`${file.name} uploaded!`);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setResponse((prev) => ({ ...prev, fileUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(response);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 sm:p-5 backdrop-blur-sm hover:border-gray-600 transition-colors">
        {/* Subtask header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-900 ${config.color}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm sm:text-base">{subtask.title}</h4>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{subtask.instructions}</p>
          </div>
        </div>

        {subtask.resourceLink && (
          <a
            href={subtask.resourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-yellow-400 text-xs sm:text-sm mb-4 hover:text-yellow-300 transition-colors bg-yellow-500/10 px-3 py-1.5 rounded-lg"
          >
            <FiLink size={12} />
            View Resource
          </a>
        )}

        {/* Response type label */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${config.color}`}>{config.label}</span>
          {existingResponse && (
            <span className="text-[10px] text-green-400/70 flex items-center gap-1">
              <FiCheckCircle size={10} /> Previously submitted
            </span>
          )}
        </div>

        {/* Dynamic input */}
        {subtask.type === 'text' && (
          <textarea
            value={response.text}
            onChange={(e) => setResponse({ ...response, text: e.target.value })}
            placeholder="Type your answer here..."
            rows={5}
            disabled={disabled}
            className={`w-full bg-gray-900 border border-gray-600 rounded-xl p-3 sm:p-4 text-white text-sm resize-y focus:outline-none ${config.borderFocus} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
          />
        )}

        {subtask.type === 'code' && (
          <div className="relative">
            <div className="absolute top-2 right-2 text-[10px] text-purple-400/50 font-mono uppercase tracking-wider px-2 py-0.5 bg-purple-500/10 rounded">code</div>
            <textarea
              value={response.code}
              onChange={(e) => setResponse({ ...response, code: e.target.value })}
              placeholder="// Paste your code here..."
              rows={12}
              disabled={disabled}
              className={`w-full bg-gray-950 border border-gray-600 rounded-xl p-3 sm:p-4 text-green-300 font-mono text-xs sm:text-sm resize-y focus:outline-none ${config.borderFocus} disabled:opacity-40 disabled:cursor-not-allowed transition-colors leading-relaxed`}
            />
          </div>
        )}

        {subtask.type === 'link' && (
          <div className="space-y-3">
            {subtask.resourceLink && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">Reference Link</span>
                <a
                  href={subtask.resourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm block truncate hover:underline mt-1"
                >
                  {subtask.resourceLink}
                </a>
              </div>
            )}
            <textarea
              value={response.text}
              onChange={(e) => setResponse({ ...response, text: e.target.value })}
              placeholder="Type your answer / explanation here..."
              rows={5}
              disabled={disabled}
              className={`w-full bg-gray-900 border border-gray-600 rounded-xl p-3 sm:p-4 text-white text-sm resize-y focus:outline-none ${config.borderFocus} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
            />
          </div>
        )}

        {subtask.type === 'file' && (
          <div className="space-y-3">
            {/* File upload zone */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.zip,.js,.html,.css,.json,.doc,.docx,.xls,.xlsx"
            />

            {!selectedFile && !response.fileUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="w-full border-2 border-dashed border-gray-600 hover:border-orange-500/50 rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer bg-gray-900/50 hover:bg-orange-500/5 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FiUpload className="text-orange-400" size={22} />
                </div>
                <p className="text-gray-300 text-sm font-medium mb-1">Click to upload a file</p>
                <p className="text-gray-600 text-xs">Max 10MB — Images, PDF, Code, Documents, ZIP</p>
              </button>
            ) : (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-orange-400/10 rounded-lg flex items-center justify-center shrink-0">
                    <FiFile className="text-orange-400" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {selectedFile?.name || response.fileUrl.split('/').pop()}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {selectedFile && (
                        <span className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)}</span>
                      )}
                      {uploading ? (
                        <span className="text-orange-400 text-xs flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border border-orange-400 border-t-transparent" />
                          Uploading...
                        </span>
                      ) : response.fileUrl ? (
                        <span className="text-green-400 text-xs flex items-center gap-1">
                          <FiCheckCircle size={10} />
                          Uploaded
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="text-gray-400 hover:text-white text-xs bg-gray-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={clearFile}
                    disabled={disabled || uploading}
                    className="text-red-400/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Fallback: manual URL */}
            <div>
              <p className="text-gray-600 text-[10px] text-center mb-2">— or paste a URL directly —</p>
              <input
                type="text"
                value={response.fileUrl}
                onChange={(e) => setResponse({ ...response, fileUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                disabled={disabled}
                className={`w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white text-sm focus:outline-none ${config.borderFocus} disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || submitting || uploading}
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
            Submitting...
          </>
        ) : (
          <>
            <FiSend size={15} />
            {existingResponse ? 'Update Response' : 'Submit Response'}
          </>
        )}
      </button>
    </form>
  );
};

export default SubmissionForm;
