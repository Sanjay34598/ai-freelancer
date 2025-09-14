import React, { useState, useCallback } from 'react';
import type { Freelancer, Job, Message, JobTest } from './types';
import Header from './components/Header';
import RoleSelection from './components/FreelancerView';
import FreelancerDashboard from './components/ClientView';
import ClientDashboard from './components/JobPostingForm';
import { evaluateSkillTest } from './services/geminiService';

const initialFreelancers: Freelancer[] = [
    { id: 'f1', name: 'Alice Photo', skill: 'Photographer', score: 88, feedback: 'Great composition and lighting.', avatarUrl: 'https://picsum.photos/seed/alice/100', walletBalance: 150 },
    { id: 'f2', name: 'Bob Dev', skill: 'Web Developer', score: 92, feedback: 'Excellent use of React hooks.', avatarUrl: 'https://picsum.photos/seed/bob/100', walletBalance: 450 },
    { id: 'f3', name: 'Charlie Writer', skill: 'Copywriter', score: 85, feedback: 'Persuasive and clear copy.', avatarUrl: 'https://picsum.photos/seed/charlie/100', walletBalance: 0 },
    { id: 'f4', name: 'Diana Dev', skill: 'Web Developer', score: 78, feedback: 'Functional component but lacks error handling.', avatarUrl: 'https://picsum.photos/seed/diana/100', walletBalance: 800 },
    { id: 'f5', name: 'Ethan Photo', skill: 'Photographer', score: 95, feedback: 'Exceptional skill in capturing mood and detail. Professional quality.', avatarUrl: 'https://picsum.photos/seed/ethan/100', walletBalance: 20 },
    { id: 'f6', name: 'Frank Writer', skill: 'Copywriter', score: 91, feedback: 'Engaging and effective storytelling.', avatarUrl: 'https://picsum.photos/seed/frank/100', walletBalance: 320 },
];

const clientUser = { id: 'c1', name: 'Client Corp' };

const FreelancerHome = () => (
  <div className="text-center mt-16 animate-fade-in">
    <h2 className="text-4xl font-bold tracking-tight">Your Freelancer Workspace</h2>
    <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
      Welcome back! You're all set to take on new projects.
    </p>
    <div className="mt-8 bg-surface-card p-8 rounded-xl max-w-lg mx-auto shadow-lg border border-surface-input">
       <p className="text-text-primary text-lg">
         Click on your profile in the top-right corner to access your dashboard, view job invitations, check your wallet, and manage skill tests.
       </p>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<'roleSelection' | 'freelancer' | 'client'>('roleSelection');
  const [currentUser, setCurrentUser] = useState<Freelancer | { id: string, name: string } | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>(initialFreelancers);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showFreelancerDashboard, setShowFreelancerDashboard] = useState(false);

  const handleToggleFreelancerDashboard = () => {
    setShowFreelancerDashboard(prev => !prev);
  };

  const handleSelectRole = (role: 'freelancer' | 'client') => {
    if (role === 'freelancer') {
      setCurrentUser(freelancers[0]);
      setView('freelancer');
      setShowFreelancerDashboard(false);
    } else {
      setCurrentUser(clientUser);
      setView('client');
    }
  };
  
  const handleSwitchRole = () => {
    setView('roleSelection');
    setCurrentUser(null);
    setShowFreelancerDashboard(false);
  };

  const findSuggestionsForJob = (job: Job) => {
    setTimeout(() => {
        const candidates = freelancers.filter(f => f.skill === job.requiredSkill);
        candidates.sort((a, b) => b.score - a.score);
        const topCandidates = candidates.slice(0, 3).map(f => f.id);
        setJobs(prev => 
            prev.map(j => j.id === job.id ? { ...j, suggestedFreelancerIds: topCandidates } : j)
        );
    }, 1500);
  };

  const handleUpdateFreelancerScore = useCallback((freelancerId: string, newScore: number, newFeedback: string) => {
    setFreelancers(prev =>
      prev.map(f =>
        f.id === freelancerId ? { ...f, score: newScore, feedback: newFeedback } : f
      )
    );
    if (currentUser && 'skill' in currentUser && currentUser.id === freelancerId) {
      setCurrentUser(prev => prev ? {...prev, score: newScore, feedback: newFeedback, walletBalance: (prev as Freelancer).walletBalance } : null);
    }
  }, [currentUser]);

  const handlePostJob = useCallback((jobData: Omit<Job, 'id' | 'clientId' | 'status' | 'assignedFreelancerId' | 'chatHistory' | 'suggestedFreelancerIds' | 'jobTests'>) => {
    if (!currentUser || 'skill' in currentUser) return;

    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      clientId: currentUser.id,
      status: 'pending_assignment',
      assignedFreelancerId: null,
      chatHistory: [],
    };
    setJobs(prev => [...prev, newJob]);
    findSuggestionsForJob(newJob);
  }, [currentUser]);
  
  const handleSendMessage = (jobId: string, messageText: string) => {
    if (!currentUser) return;
    const senderRole = 'skill' in currentUser ? 'freelancer' : 'client';
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: senderRole,
      text: messageText,
      timestamp: new Date().toISOString()
    };
    
    setJobs(prevJobs => prevJobs.map(j => 
        j.id === jobId ? { ...j, chatHistory: [...j.chatHistory, newMessage] } : j
    ));
  };

  const handleCompleteJob = (jobId: string) => {
      const job = jobs.find(j => j.id === jobId);
      if (!job || !job.assignedFreelancerId) return;

      const freelancerId = job.assignedFreelancerId;
      const budget = job.budget;

      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j));

      const updatedFreelancers = freelancers.map(f => 
        f.id === freelancerId ? { ...f, walletBalance: f.walletBalance + budget } : f
      );
      setFreelancers(updatedFreelancers);
      
      if (currentUser && 'skill' in currentUser && currentUser.id === freelancerId) {
        setCurrentUser(prev => prev ? { ...prev, walletBalance: (prev as Freelancer).walletBalance + budget } : null);
      }
  };
  
  const handleSendJobTest = (jobId: string, freelancerId: string, prompt: string) => {
    setJobs(prevJobs => prevJobs.map(j => {
        if (j.id === jobId) {
            const newTest: JobTest = { freelancerId, prompt, status: 'sent' };
            const existingTests = j.jobTests || [];
            if (existingTests.some(t => t.freelancerId === freelancerId)) return j;
            return { ...j, jobTests: [...existingTests, newTest] };
        }
        return j;
    }));
  };

  const handleUpdateJobTest = async (jobId: string, freelancerId: string, submission: string | File) => {
    const job = jobs.find(j => j.id === jobId);
    const test = job?.jobTests?.find(t => t.freelancerId === freelancerId);
    if (!job || !test) return;

    setJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        jobTests: j.jobTests?.map(t => t.freelancerId === freelancerId ? { ...t, status: 'evaluating' } : t)
    } : j));

    try {
        const result = await evaluateSkillTest(test.prompt, job.requiredSkill, submission);
        setJobs(prev => prev.map(j => j.id === jobId ? {
            ...j,
            jobTests: j.jobTests?.map(t => t.freelancerId === freelancerId ? { ...t, status: 'completed', score: result.score, feedback: result.feedback } : t)
        } : j));
    } catch (error) {
        console.error("Error updating job test", error);
        setJobs(prev => prev.map(j => j.id === jobId ? {
            ...j,
            jobTests: j.jobTests?.map(t => t.freelancerId === freelancerId ? { ...t, status: 'sent' } : t)
        } : j));
        throw error; // Propagate error to UI
    }
  };
  
  const handleHireFreelancer = (jobId: string, freelancerId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        status: 'assigned',
        assignedFreelancerId: freelancerId,
        suggestedFreelancerIds: [],
    } : j));
  };


  const renderContent = () => {
    switch (view) {
      case 'freelancer':
        return <FreelancerHome />;
      case 'client':
        if (currentUser) {
           return <ClientDashboard 
                    client={currentUser} 
                    jobs={jobs.filter(j => j.clientId === currentUser.id)} 
                    freelancers={freelancers}
                    onPostJob={handlePostJob}
                    onSendMessage={handleSendMessage}
                    onCompleteJob={handleCompleteJob}
                    onSendJobTest={handleSendJobTest}
                    onHireFreelancer={handleHireFreelancer}
                  />
        }
        return null;
      case 'roleSelection':
      default:
        return <RoleSelection onSelectRole={handleSelectRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-surface-main via-brand-dark to-surface-main text-text-primary animate-gradient-x">
      <div className="container mx-auto px-4 py-8">
        <Header 
          currentUser={currentUser} 
          onSwitchRole={handleSwitchRole}
          onToggleFreelancerDashboard={handleToggleFreelancerDashboard} 
        />
        <main className="mt-8">
          {renderContent()}
        </main>
        <footer className="text-center mt-16 text-text-secondary text-sm">
            <p>Powered by Gemini. Redefining freelance excellence.</p>
        </footer>
      </div>

      {view === 'freelancer' && showFreelancerDashboard && currentUser && 'skill' in currentUser && (
        <FreelancerDashboard 
          freelancer={currentUser as Freelancer} 
          onUpdateScore={handleUpdateFreelancerScore}
          jobs={jobs}
          onSendMessage={handleSendMessage}
          onClose={handleToggleFreelancerDashboard}
          onUpdateJobTest={handleUpdateJobTest}
        />
      )}
    </div>
  );
}