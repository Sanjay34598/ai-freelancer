import React, { useState } from 'react';
import type { Freelancer, Job } from '../types';
import JobDetails from './FreelancerSuggestions';

interface JobPostingFormProps {
    onPostJob: (job: Omit<Job, 'id' | 'clientId' | 'status' | 'assignedFreelancerId' | 'chatHistory' | 'suggestedFreelancerIds' | 'jobTests'>) => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ onPostJob }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState(100);
    const [requiredSkill, setRequiredSkill] = useState('Photographer');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || budget <= 0) return;
        onPostJob({
            title,
            description,
            budget: Number(budget),
            requiredSkill,
        });
        setTitle('');
        setDescription('');
        setBudget(100);
        setRequiredSkill('Photographer');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Job Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full bg-surface-input p-2 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1 w-full bg-surface-input p-2 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                    required
                />
            </div>
            <div>
                <label htmlFor="budget" className="block text-sm font-medium text-text-secondary">Budget ($)</label>
                <input
                    type="number"
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-1 w-full bg-surface-input p-2 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                    required
                    min="1"
                />
            </div>
            <div>
                <label htmlFor="skill" className="block text-sm font-medium text-text-secondary">Required Skill</label>
                <select
                    id="skill"
                    value={requiredSkill}
                    onChange={(e) => setRequiredSkill(e.target.value)}
                    className="mt-1 w-full bg-surface-input p-2 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                >
                    <option>Photographer</option>
                    <option>Web Developer</option>
                    <option>Copywriter</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                Find My Expert
            </button>
        </form>
    );
};


interface ClientDashboardProps {
  client: { id: string, name: string };
  jobs: Job[];
  freelancers: Freelancer[];
  onPostJob: (job: Omit<Job, 'id' | 'clientId' | 'status' | 'assignedFreelancerId' | 'chatHistory' | 'suggestedFreelancerIds' | 'jobTests'>) => void;
  onSendMessage: (jobId: string, messageText: string) => void;
  onCompleteJob: (jobId: string) => void;
  onSendJobTest: (jobId: string, freelancerId: string, prompt: string) => void;
  onHireFreelancer: (jobId: string, freelancerId: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ jobs, freelancers, onPostJob, onSendMessage, onCompleteJob, onSendJobTest, onHireFreelancer }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (selectedJob) {
    return (
      <div>
        <button onClick={() => setSelectedJob(null)} className="mb-4 text-brand-light hover:underline">&larr; Back to Dashboard</button>
        <JobDetails 
            job={selectedJob} 
            freelancers={freelancers}
            onSendMessage={onSendMessage}
            onCompleteJob={onCompleteJob}
            isClientView={true}
            onSendJobTest={onSendJobTest}
            onHireFreelancer={onHireFreelancer}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-surface-card p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
          <JobPostingForm onPostJob={onPostJob} />
        </div>
      </div>
      <div className="lg:col-span-2 bg-surface-card p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">My Posted Jobs</h2>
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-surface-main p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white">{job.title}</h3>
                  <p className="text-sm text-text-secondary">Status: <span className="font-semibold text-brand-light">{job.status.replace('_', ' ').toUpperCase()}</span></p>
                </div>
                <button onClick={() => setSelectedJob(job)} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold">Welcome!</h3>
            <p className="mt-2 text-text-secondary">You haven't posted any jobs yet. Fill out the form to find your AI-matched expert.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;