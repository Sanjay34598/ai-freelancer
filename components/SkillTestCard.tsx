import React, { useState, useEffect } from 'react';
import type { Freelancer, Job } from '../types';
import { evaluateSkillTest, generateSkillTestPrompt } from '../services/geminiService';
// FIX: Import XMarkIcon to be used in the component.
import { XMarkIcon } from './icons';

interface SkillTestFlowProps {
    candidate: Freelancer;
    onUpdateScore?: (freelancerId: string, score: number, feedback: string) => void;
    job?: Pick<Job, 'id' | 'requiredSkill'> & { prompt: string };
    onUpdateJobTest?: (jobId: string, freelancerId: string, submission: string | File) => Promise<void>;
    onClose: () => void;
}


type Step = 'selectSkill' | 'selectLevel' | 'generatePrompt' | 'takeTest' | 'evaluating' | 'results';
type Level = 'Beginner' | 'Intermediate' | 'Expert';
const skills = ['Photographer', 'Web Developer', 'Copywriter'];

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-light"></div>
        {text && <p className="text-text-secondary">{text}</p>}
    </div>
);

const SkillTestFlow: React.FC<SkillTestFlowProps> = ({ candidate, onUpdateScore, job, onUpdateJobTest, onClose }) => {
    const [step, setStep] = useState<Step>('selectSkill');
    const [selectedSkill, setSelectedSkill] = useState(candidate.skill);
    const [selectedLevel, setSelectedLevel] = useState<Level>('Intermediate');
    const [prompt, setPrompt] = useState('');
    const [submission, setSubmission] = useState<string | File>('');
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (job) {
            setStep('takeTest');
            setPrompt(job.prompt);
            setSelectedSkill(job.requiredSkill);
        } else {
            setStep('selectSkill');
        }
    }, [job]);

    const handleGeneratePrompt = async () => {
        setStep('generatePrompt');
        setError(null);
        try {
            const generatedPrompt = await generateSkillTestPrompt(selectedSkill, selectedLevel);
            setPrompt(generatedPrompt);
            setStep('takeTest');
        } catch (err: any) {
            setError(err.message || 'Failed to generate prompt.');
            setStep('selectLevel'); 
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSubmission(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async () => {
        if (!submission) {
            setError('Please provide a submission.');
            return;
        }
        setStep('evaluating');
        setError(null);
        try {
            if (job && onUpdateJobTest) {
                await onUpdateJobTest(job.id, candidate.id, submission);
                onClose(); // Close on success, dashboard will update.
            } else if (onUpdateScore) {
                const result = await evaluateSkillTest(prompt, selectedSkill, submission);
                onUpdateScore(candidate.id, result.score, result.feedback);
                setStep('results');
            } else {
                 throw new Error("Configuration error: No submit handler provided.");
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setStep('takeTest');
        } 
    };

    const renderStep = () => {
        switch (step) {
            case 'selectSkill':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Step 1: Select Your Skill</h3>
                        <select
                          value={selectedSkill}
                          onChange={(e) => setSelectedSkill(e.target.value)}
                          className="w-full bg-surface-input p-3 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                        >
                          {skills.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setStep('selectLevel')} className="mt-6 w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">Next</button>
                    </div>
                );
            case 'selectLevel':
                 return (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Step 2: Choose Your Level</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {(['Beginner', 'Intermediate', 'Expert'] as Level[]).map(level => (
                                <button key={level} onClick={() => { setSelectedLevel(level); handleGeneratePrompt(); }} className="p-4 bg-surface-input rounded-lg hover:bg-brand-primary transition-colors">{level}</button>
                            ))}
                        </div>
                         <button onClick={() => setStep('selectSkill')} className="mt-6 w-full bg-surface-input hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Back</button>
                    </div>
                );
            case 'generatePrompt':
                return <LoadingSpinner text={`Generating a ${selectedLevel} ${selectedSkill} challenge...`} />;
            case 'takeTest':
                const testType = selectedSkill === 'Photographer' ? 'image' : 'text';
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">{job ? "Client's Challenge:" : "Your Challenge:"}</h3>
                        <div className="bg-surface-main p-4 rounded-lg mb-4">
                            <p className="font-mono text-md text-text-primary">"{prompt}"</p>
                        </div>
                        {testType === 'image' ? (
                            <div>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-secondary"/>
                                {preview && <img src={preview} alt="Submission preview" className="mt-4 rounded-lg max-h-40 w-auto mx-auto"/>}
                            </div>
                        ) : (
                             <textarea
                                value={submission as string}
                                onChange={(e) => setSubmission(e.target.value)}
                                rows={8}
                                className="w-full bg-surface-input p-2 rounded-md text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="Enter your response here..."
                            />
                        )}
                        <button onClick={handleSubmit} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">Submit for Evaluation</button>
                        {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                    </div>
                );
            case 'evaluating':
                return <LoadingSpinner text="AI is evaluating your submission... This may take a moment." />;
            case 'results':
                 return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Evaluation Complete!</h3>
                        <p className="text-text-secondary mb-6">Your profile has been updated with your new score and feedback.</p>
                        <button onClick={onClose} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
                    </div>
                );
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-surface-card rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                 {renderStep()}
            </div>
        </div>
    );
};

export default SkillTestFlow;