import { useState, useRef } from 'react';
import { FiUpload, FiX, FiCheckCircle, FiSend, FiImage, FiLink } from 'react-icons/fi';
import { uploadFile } from '../services/uploadService';
import toast from 'react-hot-toast';

const SubmissionForm = ({ subtask, onSubmit, existingResponse, disabled }) => {
  // existingResponse is now an imageUrl string
  const [imageUrl, setImageUrl] = useState(existingResponse || '');
  const [preview, setPreview] = useState(existingResponse || '');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setImageUrl('');
    setUploading(true);

    try {
      const data = await uploadFile(file);
      setImageUrl(data.fileUrl);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setPreview(existingResponse || '');
      setImageUrl(existingResponse || '');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    setSubmitting(true);
    try {
      await onSubmit(imageUrl);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!imageUrl && !uploading && !disabled;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        {/* Subtask header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 border border-red-500/20">
            <FiImage className="text-red-400" size={16} />
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
            Image Proof
          </span>
          {existingResponse && (
            <span className="text-[10px] text-emerald-400/70 flex items-center gap-1">
              <FiCheckCircle size={10} /> Previously submitted
            </span>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {/* Upload zone or preview */}
        {!preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full border-2 border-dashed border-red-900/40 hover:border-red-500/40 rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer bg-black/30 hover:bg-red-500/5 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform border border-red-500/20">
              <FiUpload className="text-red-400" size={22} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">Click to upload image</p>
            <p className="text-slate-600 text-xs">JPG, PNG, WebP · Max 5MB</p>
          </button>
        ) : (
          <div className="space-y-2">
            {/* Image preview */}
            <div className="relative rounded-xl overflow-hidden border border-red-900/30 bg-black/50">
              <img
                src={preview}
                alt="Submission preview"
                className="w-full max-h-72 object-contain"
              />
              {/* Uploading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin" />
                  <span className="text-red-300 text-xs font-medium">Uploading…</span>
                </div>
              )}
              {/* Ready badge */}
              {imageUrl && !uploading && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2.5 py-1">
                  <FiCheckCircle className="text-emerald-400" size={11} />
                  <span className="text-emerald-400 text-[10px] font-semibold">Ready</span>
                </div>
              )}
            </div>

            {/* Action row */}
            {!disabled && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 text-xs text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 border border-slate-800/60 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  Replace image
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={uploading}
                  className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  <FiX size={15} />
                </button>
              </div>
            )}
          </div>
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
            {existingResponse ? 'Update Submission' : 'Submit Proof'}
          </>
        )}
      </button>
    </form>
  );
};

export default SubmissionForm;
