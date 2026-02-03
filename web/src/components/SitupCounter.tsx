"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccelerometer } from "@/hooks/useAccelerometer";

type State = "IDLE" | "MEASURING" | "COOLDOWN";
type SitupPhase = "STANDING" | "DESCENDING" | "BOTTOM" | "ASCENDING";

export const SitupCounter: React.FC = () => {
	const { data, error, isSupported, requestPermission } = useAccelerometer();
	const [count, setCount] = useState(0);
	const [state, setState] = useState<State>("IDLE");
	const [phase, setPhase] = useState<SitupPhase>("STANDING");

	// Debug UI state
	const [debugNorm, setDebugNorm] = useState(0);
	const [debugThreshold, setDebugThreshold] = useState(3.0); // Initial guess
	const [debugDepth, setDebugDepth] = useState(0); // Estimated depth (cm)
	const [lastDuration, setLastDuration] = useState(0);
	const [showDebug, setShowDebug] = useState(false);

	// --- Statistical Adaptation Logic Refs ---
	// LPF state
	const lastFilteredNorm = useRef<number>(0);
	const lastTimestamp = useRef<number>(0);

	// Dynamic Threshold Logic
	const peakBuffer = useRef<number[]>([]); // FIFO buffer for last N peaks
	const [peakBufferView, setPeakBufferView] = useState<number[]>([]); // mirror for rendering
	const currentThreshold = useRef<number>(3.0); // Th_a (Dynamic Acceleration Threshold)
	const lastActivityTime = useRef<number>(0); // For auto-reset; initialized on start to avoid impure calls during render

	// Distance Estimation Refs (Double Integration)
	const velocityZ = useRef<number>(0); // Vertical Velocity (m/s)
	const positionZ = useRef<number>(0); // Vertical Position (m, relative to start)
	const maxDepthObserved = useRef<number>(0); // Max depth in current rep (m)

	// Situp Execution State
	const repStartTime = useRef<number>(0);
	const currentRepMin = useRef<number>(0); // Accel min
	const currentRepMax = useRef<number>(0); // Accel max

	// Constants based on specification
	const BUFFER_SIZE = 5; // N
	const K_SENSITIVITY = 0.65; // K
	const LPF_ALPHA = 0.2;
	const AUTO_RESET_TIMEOUT = 30000;
	const MIN_SITUP_TIME = 400;
	const MAX_SITUP_TIME = 4000;
	const MIN_DEPTH_M = 0.15; // Minimum depth 15cm to count (Prevents shaking)

	// --- Reset Helper ---
	const resetStats = () => {
		currentThreshold.current = 3.0; // Default
		peakBuffer.current = [];
		requestAnimationFrame(() => {
			setDebugThreshold(3.0);
			setPeakBufferView([]);
		});
		console.log("Stats reset due to inactivity");
	};

	useEffect(() => {
		if (state !== "MEASURING" || !data) {
			if (data) lastTimestamp.current = data.timestamp;
			return;
		}

		const now = data.timestamp || Date.now(); // Prefer sensor timestamp
		const dt = (now - lastTimestamp.current) / 1000; // seconds
		lastTimestamp.current = now;

		if (dt <= 0 || dt > 0.5) {
			// Skip invalid time jumps
			return;
		}

		// 1. Data Preprocessing
		// Calculate Norm - 9.8 (Gravity compensation) = Linear Vertical Acceleration
		const rawNorm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
		const gravityCompensated = rawNorm - 9.8;

		// Low Pass Filter
		const filteredNorm =
			lastFilteredNorm.current * (1 - LPF_ALPHA) +
			gravityCompensated * LPF_ALPHA;
		lastFilteredNorm.current = filteredNorm;

		// --- Distance Estimation (Double Integration) ---
		// Only integrate when we think an event is happening or continuously with strong damping
		// Here we continuously integrate but dampen heavily to avoid drift when idle
		// Vel += Acc * dt
		velocityZ.current += filteredNorm * dt;
		// Damping (High-pass filter approximation) to zero out small drifts
		velocityZ.current *= 0.95;

		// Pos += Vel * dt
		// We invert the sign because +Accel (pushing up) means moving Up.
		// Gravity compensated +9.8 means accelerating upwards.
		// -9.8 (Free fall) means accelerating downwards.
		positionZ.current += velocityZ.current * dt;

		// In our logic:
		// Standing -> Drop (Negative Accel) -> Velocity becomes negative (moving down)
		// -> Position becomes negative.
		// So "Depth" is -positionZ.

		const depthM = -positionZ.current; // depth in meters

		requestAnimationFrame(() => {
			setDebugNorm(filteredNorm);
			setDebugDepth(depthM * 100); // Display in cm
		});

		// Auto-reset check
		if (
			phase === "STANDING" &&
			Date.now() - lastActivityTime.current > AUTO_RESET_TIMEOUT
		) {
			resetStats();
			lastActivityTime.current = Date.now();
		}

		const Th_a = currentThreshold.current;

		// 2. State Machine (FSM)
		if (phase === "STANDING") {
			// Start detection
			if (filteredNorm < -(Th_a * 0.5)) {
				requestAnimationFrame(() => setPhase("DESCENDING"));
				repStartTime.current = Date.now();
				currentRepMin.current = filteredNorm;
				currentRepMax.current = 0;

				// Reset Position Helper for this rep
				// We set the current position as "0" reference effectively by tracking delta,
				// but resetting accumulators is safer for discrete rep analysis.
				velocityZ.current = 0;
				positionZ.current = 0;
				maxDepthObserved.current = 0;

				lastActivityTime.current = Date.now();
			}
		} else if (phase === "DESCENDING") {
			if (filteredNorm < currentRepMin.current) {
				currentRepMin.current = filteredNorm;
			}

			// Track Max Depth (Since going down means position becomes negative, depth is -pos)
			if (depthM > maxDepthObserved.current) {
				maxDepthObserved.current = depthM;
			}

			if (filteredNorm > 0) {
				requestAnimationFrame(() => setPhase("BOTTOM"));
			}
		} else if (phase === "BOTTOM") {
			if (depthM > maxDepthObserved.current) {
				maxDepthObserved.current = depthM;
			}
			if (filteredNorm > 0.5) {
				requestAnimationFrame(() => setPhase("ASCENDING"));
			}
		} else if (phase === "ASCENDING") {
			if (filteredNorm > currentRepMax.current) {
				currentRepMax.current = filteredNorm;
			}

			const isDone = filteredNorm < 0.5 && filteredNorm > -0.5;

			if (isDone) {
				const duration = Date.now() - repStartTime.current;
				setLastDuration(duration);

				// Validation
				const absMin = Math.abs(currentRepMin.current);
				const intensity = Math.max(absMin, currentRepMax.current);

				const isValidIntensity = intensity > Th_a * 0.3;
				const isValidDuration =
					duration >= MIN_SITUP_TIME && duration <= MAX_SITUP_TIME;

				// NEW: Check Depth
				// Require at least 15cm (adjustable)
				const isDeepEnough = maxDepthObserved.current > MIN_DEPTH_M;

				if (isValidDuration && isValidIntensity && isDeepEnough) {
					setCount((c) => c + 1);
					if ("vibrate" in navigator) navigator.vibrate(100);

					// Statistical Update
					const newBuffer = [...peakBuffer.current, intensity];
					if (newBuffer.length > BUFFER_SIZE) newBuffer.shift();
					peakBuffer.current = newBuffer;

					const avgPeak =
						newBuffer.reduce((a, b) => a + b, 0) / newBuffer.length;
					const newThreshold = avgPeak * K_SENSITIVITY;

					currentThreshold.current = newThreshold;
					requestAnimationFrame(() => {
						setDebugThreshold(newThreshold);
						setPeakBufferView([...newBuffer]);
					});
				} else {
					console.log("Rep ignored:", {
						isValidDuration,
						isValidIntensity,
						isDeepEnough,
						depth: maxDepthObserved.current,
					});
				}

				requestAnimationFrame(() => setPhase("STANDING"));
				lastActivityTime.current = Date.now();
			}
		}
	}, [data, state, phase]);

	const handleStart = async () => {
		const granted = await requestPermission();
		if (granted) {
			if (data) lastTimestamp.current = data.timestamp; // Init time
			setState("MEASURING");
			setCount(0);
			setPhase("STANDING");
			resetStats();
			// set last activity time now that we're no longer rendering
			lastActivityTime.current = Date.now();
		}
	};

	const handleStop = () => {
		setState("IDLE");
	};

	if (!isSupported) {
		return (
			<div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 italic">
				加速度センサーはこのブラウザではサポートされていません。
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
			<div className="relative w-64 h-64 flex items-center justify-center rounded-full bg-white shadow-xl border-4 border-indigo-500/20 dark:bg-zinc-900 transition-all duration-500">
				<div className="text-center">
					<span className="block text-7xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
						{count}
					</span>
					<span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
						Situps
					</span>
				</div>

				{state === "MEASURING" && (
					<div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
				)}
			</div>

			<div className="flex flex-col items-center gap-2">
				<p className="text-zinc-600 dark:text-zinc-400 font-medium h-6 text-center">
					{state === "MEASURING"
						? phase === "STANDING"
							? "準備OK！腹筋を開始してください"
							: phase === "DESCENDING"
								? "下降中..."
								: phase === "BOTTOM"
									? "折り返し！"
									: "上昇中..."
						: "スタートボタンを押してください"}
				</p>
			</div>

			<div className="flex flex-col gap-4 w-full">
				{state === "IDLE" ? (
					<button
						onClick={handleStart}
						className="w-full py-4 px-8 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 text-lg"
					>
						スタート
					</button>
				) : (
					<button
						onClick={handleStop}
						className="w-full py-4 px-8 bg-zinc-200 text-zinc-800 font-bold rounded-2xl shadow-lg hover:bg-zinc-300 transition-all active:scale-95 text-lg dark:bg-zinc-800 dark:text-zinc-100"
					>
						ストップ
					</button>
				)}

				{/* デバッグ用トグルボタン */}
				<button
					onClick={() => setShowDebug(!showDebug)}
					className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
				>
					{showDebug ? "デバッグ情報を隠す" : "デバッグ情報を表示"}
				</button>
			</div>

			{/* デバッグパネル */}
			{showDebug && (
				<div className="w-full p-6 bg-zinc-900 border border-zinc-700 rounded-2xl text-[10px] font-mono text-zinc-300 space-y-3 shadow-inner">
					<div className="flex justify-between border-b border-zinc-800 pb-1">
						<span className="text-indigo-400 font-bold">
							STATISTICAL + DEPTH
						</span>
						<span
							className={
								state === "MEASURING" ? "text-green-500" : "text-zinc-600"
							}
						>
							{state}
						</span>
					</div>
					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<span>Norm (G-comp):</span>
						<span className="text-right tabular-nums text-white">
							{debugNorm.toFixed(2)} m/s²
						</span>
						<span>Est. Depth:</span>
						<span className="text-right tabular-nums text-cyan-400 font-bold">
							{debugDepth.toFixed(1)} cm
						</span>
						<span>Dyn Threshold:</span>
						<span className="text-right tabular-nums text-yellow-500">
							{debugThreshold.toFixed(2)}
						</span>
						<span>Phase:</span>
						<span className="text-right text-indigo-300">{phase}</span>
					</div>
					<div className="pt-2 border-t border-zinc-800 text-zinc-500">
						Buffer: [{peakBufferView.map((n) => n.toFixed(1)).join(", ")}]
					</div>
				</div>
			)}

			{error && (
				<p className="text-red-500 text-sm mt-4 text-center">{error}</p>
			)}

			<div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-500 space-y-2">
				<p>
					💡 <strong>ヒント:</strong>{" "}
					スマホを体幹に近い位置（胸の前など）で持ち、腹筋（シットアップ）してください。
					浅すぎる動作（15cm未満）はカウントされません。
				</p>
				<p>※ iOSの場合は、センサーの権限許可ダイアログが表示されます。</p>
			</div>
		</div>
	);
};
