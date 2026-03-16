'use client';

import { useState, useRef } from 'react';
import { Sparkles, Upload, FileText, X } from 'lucide-react';
import { exampleQuestions } from '@/lib/mock-data';

interface QueryInterfaceProps {
  onQuerySubmit: (query: string, data: any) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function QueryInterface({ onQuerySubmit, onLoadingChange }: QueryInterfaceProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [useUploaded, setUseUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    onLoadingChange?.(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          session_id: 'default',
          use_uploaded: useUploaded,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onQuerySubmit(question, data);
      } else {
        setError(data.error || 'Could not answer this question.');
      }
    } catch (err) {
      setError('Could not connect to backend. Make sure the Python server is running.');
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', 'default');

      const response = await fetch('http://127.0.0.1:8000/api/upload-csv?session_id=default', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFile(file.name);
        setUseUploaded(true);
      } else {
        setError('Failed to upload CSV file.');
      }
    } catch (err) {
      setError('Upload failed. Make sure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUseUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  return (
    <div className="fade-in space-y-4">

      {/* CSV Upload Section */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
        {uploadedFile ? (
          <div className="flex items-center gap-3 w-full">
            <FileText size={18} className="text-green-400 shrink-0" />
            <span className="text-sm text-green-400 flex-1">
              ✅ Using: <span className="font-semibold">{uploadedFile}</span>
            </span>
            <button
              onClick={handleRemoveFile}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Upload size={18} className="text-white/50 shrink-0" />
            <span className="text-sm text-white/50 flex-1">
              Using default sales dataset
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-1.5 text-xs border border-accent/50 text-accent rounded-lg hover:bg-accent/10 transition-all font-semibold disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : '📂 Upload Your CSV'}
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={uploadedFile
              ? `Ask anything about ${uploadedFile}...`
              : "Ask anything like: Show me monthly sales by region for Q3..."
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-base text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all resize-none h-28"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary via-purple-500 to-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI is analyzing your query...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Dashboard
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Example Questions:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-accent transition-colors text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}