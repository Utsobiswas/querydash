'use client';

import { History, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  questionHistory?: { query: string; timestamp: string }[];
  onClearHistory?: () => void;
  onQuestionClick?: (query: string) => void;
}

export function Sidebar({ isOpen, questionHistory = [], onClearHistory, onQuestionClick }: SidebarProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />
      )}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass border-r border-white/10 transform transition-transform duration-300 z-40 lg:static lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History size={18} className="text-accent" />
              <h2 className="font-semibold">Recent Questions</h2>
            </div>
            {questionHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-white/30 hover:text-red-400 transition-colors"
                title="Clear history"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {questionHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-white/30">No questions yet</p>
                <p className="text-xs text-white/20 mt-1">Ask something to get started!</p>
              </div>
            ) : (
              [...questionHistory].reverse().map((item, index) => (
                <div
                  key={index}
                  onClick={() => onQuestionClick?.(item.query)}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group border border-white/5"
                >
                  <p className="text-xs text-white/70 truncate group-hover:text-white transition-colors">
                    {item.query}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {formatTime(item.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
} 