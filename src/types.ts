export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface PersonaPreset {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  temperature: number;
  iconName: string;
}

export interface OptimizedPrompt {
  title: string;
  text: string;
  explanation: string;
}

export interface OptimizationResult {
  critique: string;
  optimizedPrompts: OptimizedPrompt[];
  tips: string[];
}

export interface IdeationConcept {
  conceptTitle: string;
  oneSentenceHook: string;
  keySections: string[];
}

export interface PolishResult {
  critique: string;
  improvementsMade: string[];
  polishedText: string;
}

export interface WorkflowState {
  currentStep: "ideate" | "draft" | "polish";
  inputs: {
    topic: string;
    selectedConcept: IdeationConcept | null;
    draftStyle: string;
    draftLength: string;
    draftText: string;
    polishFocus: string;
  };
  outputs: {
    concepts: IdeationConcept[];
    draft: string;
    polish: PolishResult | null;
  };
  isLoading: boolean;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  type: "playground" | "optimizer" | "workflow";
  title: string;
  date: string;
  payload: any;
}
