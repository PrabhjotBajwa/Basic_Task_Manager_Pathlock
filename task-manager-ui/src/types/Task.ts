export interface Task {
  id: string; // GUIDs are strings in JSON
  description: string;
  isCompleted: boolean;
}