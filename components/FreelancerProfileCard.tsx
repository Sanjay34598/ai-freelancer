import React from 'react';
import type { Freelancer } from '../types';
import { StarIcon } from './icons';

interface FreelancerProfileCardProps {
  freelancer: Freelancer;
  rank?: number;
  children?: React.ReactNode;
}

const FreelancerProfileCard: React.FC<FreelancerProfileCardProps> = ({ freelancer, rank, children }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'border-amber-400 text-amber-400';
    if (rank === 2) return 'border-slate-300 text-slate-300';
    if (rank === 3) return 'border-amber-600 text-amber-600';
    return 'border-transparent text-text-secondary';
  }

  return (
    <div className="bg-surface-main p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:bg-surface-input">
      {rank && (
         <div className={`text-xl font-bold ${getRankColor(rank)} flex-shrink-0 w-8 text-center`}>
            #{rank}
        </div>
      )}
      <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-secondary"/>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
            <div>
                <h4 className="text-lg font-bold text-white">{freelancer.name}</h4>
                <p className="text-sm text-text-accent">{freelancer.skill}</p>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-amber-400 bg-surface-card px-3 py-1 rounded-full">
                <StarIcon className="w-5 h-5"/>
                <span>{freelancer.score}</span>
            </div>
        </div>
        <div className="mt-2 text-sm text-text-secondary italic bg-black/20 p-2 rounded-md">
            <span className="font-semibold not-italic">AI Feedback:</span> "{freelancer.feedback}"
        </div>
      </div>
      {children && (
        <div className="self-center flex flex-col items-stretch gap-2 ml-4 w-40 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default FreelancerProfileCard;