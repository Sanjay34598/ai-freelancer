import React from 'react';
import { BriefcaseIcon, UserGroupIcon } from './icons';

interface RoleSelectionProps {
  onSelectRole: (role: 'freelancer' | 'client') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold tracking-tight">Welcome to TalentQuest AI</h2>
      <p className="mt-2 text-lg text-text-secondary max-w-2xl mx-auto">
        The intelligent platform connecting elite freelancers with innovative clients. Choose your path below to get started.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <button
          onClick={() => onSelectRole('freelancer')}
          className="group bg-surface-card p-8 rounded-xl shadow-lg hover:shadow-brand-primary/40 hover:-translate-y-2 transition-all duration-300 text-left"
        >
          <UserGroupIcon className="w-12 h-12 text-brand-light bg-brand-dark p-2 rounded-lg mb-4" />
          <h3 className="text-2xl font-bold text-white">I'm looking for work</h3>
          <p className="text-text-secondary mt-2">
            Take an AI-powered skill test, get a private score, and let us match you with the perfect client projects.
          </p>
          <span className="font-bold text-brand-light mt-6 inline-block group-hover:underline">
            Enter Freelancer Hub &rarr;
          </span>
        </button>
        <button
          onClick={() => onSelectRole('client')}
          className="group bg-surface-card p-8 rounded-xl shadow-lg hover:shadow-brand-primary/40 hover:-translate-y-2 transition-all duration-300 text-left"
        >
          <BriefcaseIcon className="w-12 h-12 text-brand-light bg-brand-dark p-2 rounded-lg mb-4" />
          <h3 className="text-2xl font-bold text-white">I need a project done</h3>
          <p className="text-text-secondary mt-2">
            Post your job and our AI will assign the best-suited, skill-verified freelancer to bring your vision to life.
          </p>
           <span className="font-bold text-brand-light mt-6 inline-block group-hover:underline">
            Enter Client Hub &rarr;
          </span>
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
