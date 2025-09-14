import React from 'react';
import type { Freelancer } from '../types';
import { ArrowLeftOnRectangleIcon } from './icons';

interface HeaderProps {
  currentUser: Freelancer | { id: string; name: string } | null;
  onSwitchRole: () => void;
  onToggleFreelancerDashboard?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onSwitchRole, onToggleFreelancerDashboard }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Talent<span className="text-brand-light">Quest</span> AI
        </h1>
        <p className="text-text-secondary">AI-Verified Freelance Experts</p>
      </div>
      <div className="flex items-center gap-4">
        {currentUser && 'skill' in currentUser && onToggleFreelancerDashboard && (
          <button
            onClick={onToggleFreelancerDashboard}
            className="flex items-center gap-3 bg-surface-card p-2 pr-4 rounded-full transition-all duration-300 hover:bg-surface-input shadow-lg"
          >
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-brand-secondary"/>
            <div>
                <p className="font-bold text-white text-sm text-left">{currentUser.name}</p>
                <p className="font-mono text-xs text-green-400 text-left">${currentUser.walletBalance.toFixed(2)}</p>
            </div>
          </button>
        )}
        {currentUser && (
          <button
            onClick={onSwitchRole}
            className="px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 font-semibold bg-surface-card hover:bg-surface-input"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Switch Role</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;