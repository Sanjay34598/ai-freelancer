import React, { useState, useRef, useEffect } from 'react';
import type { Freelancer, Job } from '../types';
import FreelancerProfileCard from './FreelancerProfileCard';
import { PaperAirplaneIcon, PencilSquareIcon, XMarkIcon } from './icons';

interface JobDetailsProps {
  job: Job;
  freelancers: Freelancer[];
  onSendMessage: (jobId: string, messageText: string) => void;
  onCompleteJob?: (jobId: string) => void;
  isClientView: boolean;
  onSendJobTest?: (jobId: string, freelancerId: string, prompt: string) => void;
  onHireFreelancer?: (jobId: string, freelancerId: string) => void;
}

const ChatInterface: React.FC<{ job: Job; onSendMessage: (jobId: string, messageText: string) => void, isClientView: boolean }> = ({ job, onSendMessage, isClientView }) => {
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [job.chatHistory]);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(job.id, message);
            setMessage('');
        }
    };
    
    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">Project Chat</h3>
            <div className="bg-surface-main h-80 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
                {job.chatHistory.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${((isClientView && msg.sender === 'client') || (!isClientView && msg.sender === 'freelancer')) ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${((isClientView && msg.sender === 'client') || (!isClientView && msg.sender === 'freelancer')) ? 'bg-brand-primary' : 'bg-surface-input'}`}>
                            <p className="text-white text-sm">{msg.text}</p>
                       </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-grow bg-surface-input p-2.5 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                    disabled={job.status === 'completed'}
                />
                <button onClick={handleSend} disabled={job.status === 'completed'} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold p-2.5 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <PaperAirplaneIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    )
}

const SendTestModal: React.FC<{
  freelancer: Freelancer;
  onSend: (prompt: string) => void;
  onClose: () => void;
}> = ({ freelancer, onSend, onClose }) => {
  const [prompt, setPrompt] = useState('');

  const handleSend = () => {
    if (prompt.trim()) {
      onSend(prompt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-card rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-white mb-2">Send Skill Test to {freelancer.name}</h3>
        <p className="text-text-secondary mb-4">Write a short, project-specific prompt for the freelancer.</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full bg-surface-input p-2 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
          placeholder={`e.g., "Take a photo of a product with a plain white background." or "Write a 2-sentence marketing email subject line for a new app."`}
        />
        <button onClick={handleSend} className="mt-6 w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
          Send Challenge
        </button>
      </div>
    </div>
  );
};


const JobDetails: React.FC<JobDetailsProps> = ({ job, freelancers, onSendMessage, onCompleteJob, isClientView, onSendJobTest, onHireFreelancer }) => {
  const [testModalFreelancer, setTestModalFreelancer] = useState<Freelancer | null>(null);
  
  const assignedFreelancer = job.assignedFreelancerId ? freelancers.find(f => f.id === job.assignedFreelancerId) || null : null;
  const suggestedFreelancers = job.suggestedFreelancerIds?.map(id => freelancers.find(f => f.id === id)).filter(Boolean) as Freelancer[] || [];

  const renderSuggestionView = () => (
    <div>
        <h3 className="text-xl font-bold mb-4">AI Recommended Experts</h3>
        {suggestedFreelancers.length > 0 ? (
          <div className="space-y-4">
            {suggestedFreelancers.map((freelancer, index) => {
              const test = job.jobTests?.find(t => t.freelancerId === freelancer.id);
              return (
                 <FreelancerProfileCard key={freelancer.id} freelancer={freelancer} rank={index + 1}>
                    {test?.status === 'completed' && (
                       <div className="text-right">
                         <p className="text-sm font-semibold text-text-secondary">Job Test Score: <span className="font-bold text-lg text-amber-400">{test.score}/100</span></p>
                         <p className="text-xs text-text-secondary italic mt-1">"{test.feedback}"</p>
                       </div>
                    )}

                    {onHireFreelancer && (
                        <button 
                            onClick={() => onHireFreelancer(job.id, freelancer.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                           Hire Now
                        </button>
                    )}
                    
                    {onSendJobTest && (
                       <button
                          onClick={() => setTestModalFreelancer(freelancer)}
                          disabled={!!test}
                          className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-dark disabled:bg-surface-input disabled:text-text-secondary disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          {test ? `Test ${test.status}` : 'Send Skill Test'}
                        </button>
                    )}
                 </FreelancerProfileCard>
              )
            })}
          </div>
        ) : (
             <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-light mx-auto"></div>
                <p className="mt-4 text-text-secondary">Our AI is analyzing your project to find the perfect match...</p>
            </div>
        )}
    </div>
  );

  const renderAssignedView = () => (
     <>
      <div>
        <h3 className="text-xl font-bold mb-4">Assigned Expert</h3>
        {assignedFreelancer && (
          <FreelancerProfileCard freelancer={assignedFreelancer} />
        )}
      </div>
      <ChatInterface job={job} onSendMessage={onSendMessage} isClientView={isClientView}/>
      {isClientView && onCompleteJob && job.status === 'assigned' && (
        <div className="mt-6 border-t border-surface-input pt-6 text-center">
            <p className="text-text-secondary mb-4">Once the work is complete and you are satisfied, complete the project to release payment.</p>
            <button 
                onClick={() => onCompleteJob(job.id)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
            >
                Mark as Complete & Pay ${job.budget}
            </button>
        </div>
      )}
     </>
  );

  return (
    <div className="bg-surface-card p-6 rounded-xl shadow-lg">
      <div className="border-b border-surface-input pb-4 mb-4">
        <div className="flex justify-between items-start">
            <div>
                 <h2 className="text-2xl font-bold">Job: <span className="text-brand-light">{job.title}</span></h2>
                 <p className="text-text-secondary mt-1">{job.description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="text-text-secondary text-sm">Budget</p>
                <p className="font-bold text-2xl text-green-400">${job.budget}</p>
                 <p className={`mt-2 text-sm font-semibold px-2 py-0.5 rounded-full ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{job.status.replace('_', ' ').toUpperCase()}</p>
            </div>
        </div>
      </div>
      
      {job.status === 'pending_assignment' ? renderSuggestionView() : renderAssignedView()}

      {testModalFreelancer && onSendJobTest && (
        <SendTestModal 
          freelancer={testModalFreelancer}
          onClose={() => setTestModalFreelancer(null)}
          onSend={(prompt) => onSendJobTest(job.id, testModalFreelancer.id, prompt)}
        />
      )}
    </div>
  );
};

export default JobDetails;