'use client';

import { History } from 'lucide-react';
import { queryHistory } from '@/lib/mock-data';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // This will be handled by parent
            }
          }}
        />
      )}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass border-r border-white/10 transform transition-transform duration-300 z-40 lg:static lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <History size={18} className="text-accent" />
            <h2 className="font-semibold">Recent Questions</h2>
          </div>

          <div className="space-y-3">
            {queryHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg glass-subtle hover:bg-white/8 transition-colors cursor-pointer group"
              >
                <p className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
                  {item.query}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
