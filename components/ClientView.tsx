import React, { useState } from 'react';
import type { Freelancer, Job } from '../types';
import SkillTestFlow from './SkillTestCard';
import JobDetails from './FreelancerSuggestions';
import { StarIcon, WalletIcon, XMarkIcon, BriefcaseIcon } from './icons';

interface FreelancerDashboardProps {
  freelancer: Freelancer;
  jobs: Job[];
  onUpdateScore: (freelancerId: string, score: number, feedback: string) => void;
  onUpdateJobTest: (jobId: string, freelancerId: string, submission: string | File) => Promise<void>;
  onSendMessage: (jobId: string, messageText: string) => void;
  onClose: () => void;
}

const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ freelancer, jobs, onUpdateScore, onUpdateJobTest, onSendMessage, onClose }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [takingJobTest, setTakingJobTest] = useState<Job | null>(null);

  const assignedJobs = jobs.filter(j => j.assignedFreelancerId === freelancer.id);
  const invitations = jobs.filter(j => 
    j.jobTests?.some(t => t.freelancerId === freelancer.id && t.status === 'sent')
  );
  
  const handleStartJobTest = (job: Job) => {
    setTakingJobTest(job);
  };

  const mainContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-surface-main/70 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">My Profile</h2>
          <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-24 h-24 rounded-full mx-auto border-4 border-brand-secondary"/>
          <h3 className="text-xl text-center font-bold mt-4">{freelancer.name}</h3>
          <p className="text-center text-text-accent">{freelancer.skill}</p>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center bg-surface-input p-3 rounded-lg">
              <span className="font-semibold text-text-secondary flex items-center gap-2"><StarIcon className="w-5 h-5 text-amber-400"/> AI Score</span>
              <span className="font-bold text-lg text-amber-400">{freelancer.score} / 100</span>
            </div>
            <div className="flex justify-between items-center bg-surface-input p-3 rounded-lg">
              <span className="font-semibold text-text-secondary flex items-center gap-2"><WalletIcon className="w-5 h-5 text-green-400"/> Wallet</span>
              <span className="font-bold text-lg text-green-400">${freelancer.walletBalance.toFixed(2)}</span>
            </div>
            <div className="bg-surface-input p-3 rounded-lg">
              <p className="text-sm text-text-secondary italic"><span className="font-semibold not-italic text-text-primary">Latest AI Feedback:</span> "{freelancer.feedback}"</p>
            </div>
          </div>
          <button onClick={() => setIsTesting(true)} className="mt-6 w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
            Update General Skill Test
          </button>
        </div>
         <div className="bg-surface-main/70 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BriefcaseIcon className="w-6 h-6"/> Job Invitations</h2>
          {invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map(job => (
                <div key={job.id} className="bg-surface-input p-3 rounded-lg">
                  <p className="font-bold text-white">{job.title}</p>
                  <p className="text-sm text-text-secondary mb-2">A client has requested a skill test.</p>
                  <button onClick={() => handleStartJobTest(job)} className="w-full text-sm bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-3 rounded-lg transition-colors">
                    Take Test
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">No new job invitations.</p>
          )}
        </div>
      </div>
      <div className="lg:col-span-2 bg-surface-main/70 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">My Assigned Jobs</h2>
        {assignedJobs.length > 0 ? (
          <div className="space-y-4">
            {assignedJobs.map(job => (
              <div key={job.id} className="bg-surface-input p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white">{job.title}</h3>
                  <p className={`text-sm font-semibold ${job.status === 'completed' ? 'text-green-400' : 'text-cyan-400'}`}>{job.status.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedJob(job)} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  View & Chat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">You have not been assigned to any jobs yet.</p>
        )}
      </div>
    </div>
  );

  const jobDetailsContent = (
    <div>
        <button onClick={() => setSelectedJob(null)} className="mb-4 text-brand-light hover:underline font-semibold">&larr; Back to Dashboard</button>
        <JobDetails 
            job={selectedJob!}
            freelancers={[freelancer]}
            onSendMessage={onSendMessage}
            isClientView={false}
        />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-40 animate-fade-in">
      <div className="bg-surface-card rounded-xl shadow-2xl w-full h-full max-w-7xl relative flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-surface-input">
          <h2 className="text-2xl font-bold">My Dashboard</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-input transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          {selectedJob ? jobDetailsContent : mainContent}
        </div>
      </div>
      {isTesting && (
        <SkillTestFlow 
          candidate={freelancer}
          onUpdateScore={(id, score, feedback) => {
            onUpdateScore(id, score, feedback);
            setIsTesting(false); 
          }}
          onClose={() => setIsTesting(false)}
        />
      )}
      {takingJobTest && (
        <SkillTestFlow
          candidate={freelancer}
          job={{
            id: takingJobTest.id,
            requiredSkill: takingJobTest.requiredSkill,
            prompt: takingJobTest.jobTests?.find(t => t.freelancerId === freelancer.id)?.prompt || '',
          }}
          onUpdateJobTest={async (jobId, freelancerId, submission) => {
            await onUpdateJobTest(jobId, freelancerId, submission);
            setTakingJobTest(null);
          }}
          onClose={() => setTakingJobTest(null)}
        />
      )}
    </div>
  );
};

export default FreelancerDashboard;