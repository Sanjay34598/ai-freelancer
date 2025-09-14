import type React from 'react';

// This enum is no longer used for top-level view switching.
export enum View {
  FREELANCER = 'FREELANCER',
  CLIENT = 'CLIENT',
}

export interface SkillTest {
  id: string;
  skill: string;
  title: string;
  description: string;
  prompt: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  testType: 'image' | 'text';
}

export interface Freelancer {
  id: string;
  name: string;
  skill: string;
  score: number;
  feedback: string;
  avatarUrl: string;
  walletBalance: number;
}

export interface Message {
    id: string;
    sender: 'client' | 'freelancer';
    text: string;
    timestamp: string;
}

export interface JobTest {
  freelancerId: string;
  prompt: string;
  status: 'sent' | 'evaluating' | 'completed';
  score?: number;
  feedback?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  requiredSkill: string;
  clientId: string;
  status: 'pending_assignment' | 'assigned' | 'completed';
  assignedFreelancerId: string | null;
  suggestedFreelancerIds?: string[];
  jobTests?: JobTest[];
  chatHistory: Message[];
}