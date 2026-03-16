'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, FileText, X, Loader2 } from 'lucide-react';
import { exampleQuestions } from '@/lib/mock-data';

const BACKEND_URL = 'https://querydash-production.up.railway.app';

interface QueryInterfaceProps {
  onQuerySubmit: (query: string, data: any) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  prefillQuestion?: string;
  onPrefillUsed?: () => void;
}

export function QueryInterface({ onQuerySubmit, onLoadingChange, prefillQuestion, onPrefillUsed }: QueryInterfaceProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [useUploaded, setUseUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    'Connecting to AI engine...',
    'Analyzing your question...',
    'Querying the data...',
    'Selecting best chart types...',
    'Building your dashboard...',
    'Almost ready...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let index = 0;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (prefillQuestion) {
      setQuestion(prefillQuestion);
      onPrefillUsed?.();
    }
  }, [prefillQuestion]);

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Failed after retries');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    onLoadingChange?.(true);

    try {
      const response = await fetchWithRetry(
        `${BACKEND_URL}/api/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question,
            session_id: 'default',
            use_uploaded: useUploaded,
          }),
        },
        3
      );

      const data = await response.json();

      if (data.success) {
        onQuerySubmit(question, data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/upload-csv?session_id=default`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFile(file.name);
        setUseUploaded(true);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUseUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <button onClick={handleRemoveFile} className="text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Upload size={18} className="text-white/50 shrink-0" />
            <span className="text-sm text-white/50 flex-1">Using default sales dataset</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-1.5 text-xs border border-accent/50 text-accent rounded-lg hover:bg-accent/10 transition-all font-semibold disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : '📂 Upload Your CSV'}
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
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

        {/* Loading Status */}
        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-3 bg-accent/10 border border-accent/20 rounded-lg">
            <Loader2 size={16} className="text-accent animate-spin shrink-0" />
            <span className="text-sm text-accent">{loadingMessage}</span>
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
                <Loader2 size={20} className="animate-spin" />
                Processing...
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
                onClick={() => setQuestion(example)}
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