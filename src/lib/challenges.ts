export interface Challenge { id: string; level: string; text: string; points: number; check: RegExp; best: number | null }

export const CHALLENGES: Challenge[] = [
  { id: "b1", level: "BEGINNER", text: "Make the drivetrain move forward.", points: 50, check: /forward|speed|drive/i, best: 100 },
  { id: "i1", level: "INTERMEDIATE", text: "Make the robot turn exactly 90 degrees.", points: 120, check: /90/, best: null },
  { id: "a1", level: "ADVANCED", text: "Use a distance sensor to stop the robot at a specific distance.", points: 250, check: /distance/i, best: null },
  { id: "e1", level: "EXPERT", text: "Create a fully autonomous scoring routine.", points: 500, check: /(auton|score)[\s\S]*(turn|drive)/i, best: null },
];
