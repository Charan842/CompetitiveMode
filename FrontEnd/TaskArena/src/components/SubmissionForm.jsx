import { useState, useRef } from 'react';
import { FiUpload, FiX, FiCheckCircle, FiSend, FiFileText, FiLink, FiCode, FiImage } from 'react-icons/fi';
import { uploadFile } from '../services/uploadService';
import toast from 'react-hot-toast';

const typeConfig = {
  text:  { label: 'Text Response', placeholder: 'Enter your answer here...', Icon: FiFileText, color: 'blue' },
  link:  { label: 'URL / Link',    placeholder: 'https://...',               Icon: FiLink,     color: 'emerald' },
  code:  { label: 'Code',          placeholder: '// paste your code here...', Icon: FiCode,    color: 'violet' },
  file:  { label: 'File Upload',   placeholder: '',                           Icon: FiUpload,   color: 'orange' },
  image: { label: 'Image Upload',  placeholder: '',                           Icon: FiImage,    color: 'pink' },
};

const SubmissionForm = ({ subtask, onSubmit, existingResponse, disabled }) => {
  const type = subtask.type || 'text';
  const cfg = typeConfig[type] || typeConfig.text;

  const [textValue, setTextValue] = useState(
    (type === 'text' || type === 'link') ? (existingResponse?.text || '') : ''
  );
  const [codeValue, setCodeValue] = useState(existingResponse?.code || '');
  const [fileUrl, setFileUrl] = useState(existingResponse?.fileUrl || '');
  const [preview, setPreview] = useState(existingResponse?.fileUrl || '');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'image') {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        toast.error('Only JPG, PNG, and WebP images are allowed');
        return;
      }
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be under 2MB');
      return;
    }
    setPreview(type === 'image' ? URL.createObjectURL(file) : file.name);
    setFileUrl('');
    setUploading(true);
    try {
      const data = await uploadFile(file);
      setFileUrl(data.fileUrl);
      if (type === 'image') setPreview(data.fileUrl);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setPreview(existingResponse?.fileUrl || '');
      setFileUrl(existingResponse?.fileUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setPreview('');
    setFileUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response = {};
    if (type === 'text' || type === 'link') {
      if (!textValue.trim()) return;
      response = { text: textValue.trim() };
    } else if (type === 'code') {
      if (!codeValue.trim()) return;
      response = { code: codeValue.trim() };
    } else if (type === 'file' || type === 'image') {
      if (!fileUrl) return;
      response = { fileUrl };
    }
    setSubmitting(true);
    try {
      await onSubmit(response);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !disabled && !uploading && (
    ((type === 'text' || type === 'link') && !!textValue.trim()) ||
    (type === 'code' && !!codeValue.trim()) ||
    ((type === 'file' || type === 'image') && !!fileUrl)
  );

  const isImageFile = preview?.startsWith('data:image');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        {/* Subtask header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 border border-red-500/20">
            <cfg.Icon className="text-red-400" size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm sm:text-base">{subtask.title}</h4>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{subtask.instructions}</p>
          </div>
        </div>

        {subtask.resourceLink && (
          <a
            href={subtask.resourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-red-400/70 text-xs mb-4 hover:text-red-400 transition-colors bg-red-500/10 border border-red-500/15 px-3 py-1.5 rounded-lg no-underline"
          >
            <FiLink size={11} />
            View Resource
          </a>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-red-400/60">
            {cfg.label}
          </span>
          {existingResponse && (
            <span className="text-[10px] text-emerald-400/70 flex items-center gap-1">
              <FiCheckCircle size={10} /> Previously submitted
            </span>
          )}
        </div>

        {/* Text type */}
        {type === 'text' && (
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            disabled={disabled}
            placeholder={cfg.placeholder}
            rows={5}
            className="w-full bg-black/40 border border-slate-800/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/40 resize-none disabled:opacity-40"
          />
        )}

        {/* Link type */}
        {type === 'link' && (
          <input
            type="url"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            disabled={disabled}
            placeholder={cfg.placeholder}
            className="w-full bg-black/40 border border-slate-800/60 rounded-xl px-3 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 disabled:opacity-40"
          />
        )}

        {/* Code type */}
        {type === 'code' && (
          <textarea
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value)}
            disabled={disabled}
            placeholder={cfg.placeholder}
            rows={8}
            spellCheck={false}
            className="w-full bg-black/60 border border-violet-900/30 rounded-xl px-3 py-2.5 text-emerald-300 text-xs font-mono placeholder-slate-700 focus:outline-none focus:border-violet-500/40 resize-y disabled:opacity-40"
          />
        )}

        {/* File / Image type */}
        {(type === 'file' || type === 'image') && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={type === 'image' ? 'image/jpeg,image/png,image/webp' : undefined}
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />

            {!preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="w-full border-2 border-dashed border-red-900/40 hover:border-red-500/40 rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer bg-black/30 hover:bg-red-500/5 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform border border-red-500/20">
                  {type === 'image'
                    ? <FiImage className="text-pink-400" size={22} />
                    : <FiUpload className="text-red-400" size={22} />
                  }
                </div>
                <p className="text-slate-300 text-sm font-medium mb-1">
                  {type === 'image' ? 'Click to upload image' : 'Click to upload file'}
                </p>
                <p className="text-slate-600 text-xs">
                  {type === 'image' ? 'JPG, PNG, WebP · Max 2MB' : 'Max 2MB'}
                </p>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-red-900/30 bg-black/50">
                  {isImageFile ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      <FiUpload className="text-orange-400 shrink-0" size={20} />
                      <span className="text-slate-300 text-sm truncate">{preview}</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin" />
                      <span className="text-red-300 text-xs font-medium">Uploading…</span>
                    </div>
                  )}
                  {fileUrl && !uploading && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2.5 py-1">
                      <FiCheckCircle className="text-emerald-400" size={11} />
                      <span className="text-emerald-400 text-[10px] font-semibold">Ready</span>
                    </div>
                  )}
                </div>
                {!disabled && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1 text-xs text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 border border-slate-800/60 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {type === 'image' ? 'Replace image' : 'Replace file'}
                    </button>
                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={uploading}
                      className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full flex items-center justify-center gap-2 neon-button py-3 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            Submitting…
          </>
        ) : (
          <>
            <FiSend size={15} />
            {existingResponse ? 'Update Submission' : 'Submit'}
          </>
        )}
      </button>
    </form>
  );
};

export default SubmissionForm;
