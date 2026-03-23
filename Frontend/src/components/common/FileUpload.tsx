import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, File as FileIcon, Loader2, Upload, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type FileStatus = 'uploading' | 'success' | 'error';

type FileEntry = {
  file: File;
  status: FileStatus;
  id: string;
};

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const createId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  label = 'Upload Documents',
  description = 'Drag and drop your files here, or click to browse',
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return 'Unsupported file type. Please upload JPG, PNG, or PDF files.';
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSize}MB.`;
    }

    return null;
  };

  const processFiles = (incoming: FileList | null) => {
    if (!incoming || disabled) return;

    setErrorMessage(null);

    const validFiles: File[] = [];
    const nextEntries: FileEntry[] = [];

    Array.from(incoming).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      const id = createId();
      validFiles.push(file);
      nextEntries.push({ file, status: 'uploading', id });

      // Simulate upload status; replace with real upload later.
      setTimeout(() => {
        setFiles((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status: 'success' } : entry)));
      }, 900);
    });

    if (nextEntries.length > 0) {
      setFiles((prev) => [...prev, ...nextEntries]);
    }

    if (onUpload && validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((entry) => entry.id !== id));
  };

  const openFilePicker = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all text-center ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.99]'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept={acceptedTypes.join(',')}
          disabled={disabled}
        />

        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              isDragging ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
            }`}
          >
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{label}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{description}</p>
          <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Max size: {maxSize}MB</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>JPG, PNG, PDF</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Uploaded Files</h4>
            <div className="grid grid-cols-1 gap-3">
              {files.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{entry.file.name}</p>
                    <p className="text-[10px] text-slate-400">{(entry.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                    {entry.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {entry.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile(entry.id);
                      }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
