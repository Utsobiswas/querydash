'use client';

import { useState } from 'react';
import { Menu, X, Settings } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: (isOpen: boolean) => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
    onMenuToggle(!isOpen);
  };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMenuClick}
            className="rounded-lg p-2 hover:bg-white/10 transition-colors lg:hidden"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">BI</span>
            </div>
            <h1 className="text-xl font-bold">Business Insights</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Data Synced</span>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
