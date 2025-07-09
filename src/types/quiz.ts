export interface QuizQuestion {
  id: string;
  question: string;
  videoUrl: string;
  answers: string[]; // ["Normal", "Reduced", "Abnormal"]
  correct: string;
  metadata: {
    ESV: number;
    EDV: number;
    FrameHeight: number;
    FrameWidth: number;
    FPS: number;
    NumberOfFrames: number;
  };
}

export interface QuizResults {
  userID: string;
  score: number;
  ai_score: number;
  total: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PredictionRequest {
  ESV: number;
  EDV: number;
  FrameHeight: number;
  FrameWidth: number;
  FPS: number;
  NumberOfFrames: number;
}

export interface PredictionResponse {
  prediction: string;
}
