export interface User {
  id: number;
  email: string;
  name: string;
  weight?: number;
  height?: number;
  goal_weight?: number;
  diet_goal?: string;
}

export interface Meal {
  id: number;
  user_id: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image_url: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  timestamp: string;
}

export interface WaterLog {
  id: number;
  user_id: number;
  amount: number;
  timestamp: string;
}

export interface AnalysisResult {
  items: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitamins: {
      A: number;
      B: number;
      C: number;
      D: number;
    };
  };
  confidence: number;
}
