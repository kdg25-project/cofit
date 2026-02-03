export const EXERCISES = [
	{ mode: "situp", label: "腹筋" },
	{ mode: "squat", label: "スクワット" },
	{ mode: "pushup", label: "腕立て伏せ" },
] as const;

export type ExerciseMode = (typeof EXERCISES)[number]["mode"];

export const DEFAULT_EXERCISE_MODE: ExerciseMode = EXERCISES[0].mode;

export function getExerciseLabel(mode?: string | null) {
	const hit = EXERCISES.find((exercise) => exercise.mode === mode);
	return hit?.label ?? EXERCISES[0].label;
}
