import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
	label: string;
	value: number;
	max: number;
	size?: number;
	stroke?: number;
};

export function MissionProgressRing({
	label,
	value,
	max,
	size = 212,
	stroke = 20,
}: Props) {
	const safeMax = Math.max(1, max);
	const pct = Math.max(0, Math.min(1, value / safeMax));
	const isClear = value >= safeMax;

	const prevClear = useRef(false);
	const [justCleared, setJustCleared] = useState(false);

	useEffect(() => {
		if (!prevClear.current && isClear) {
			prevClear.current = true;
			const t1 = setTimeout(() => setJustCleared(true), 0);
			const t2 = setTimeout(() => setJustCleared(false), 500);
			return () => {
				clearTimeout(t1);
				clearTimeout(t2);
			};
		}
		if (!isClear) prevClear.current = false;
	}, [isClear]);

	const vb = 200; // ViewBox size
	const cx = vb / 2;
	const cy = vb / 2;
	const r = (vb - stroke) / 2;
	const c = 2 * Math.PI * r;

	const targetDashOffset = c * (1 - pct);
	const [dashOffset, setDashOffset] = useState(c); // Start from 0 progress
	const [animate, setAnimate] = useState(false);

	useEffect(() => {
		// Trigger animation on mount
		const t = setTimeout(() => {
			setAnimate(true);
			setDashOffset(targetDashOffset);
		}, 100);
		return () => clearTimeout(t);
	}, [targetDashOffset]);

	const maskId = useMemo(
		() => `ringMask-${label.replace(/\s+/g, "")}-${size}-${stroke}`,
		[label, size, stroke],
	);

	return (
		<div className="w-full flex justify-center py-12">
			<div className="relative" style={{ width: size, height: size }}>
				<svg
					viewBox={`0 0 ${vb} ${vb}`}
					width={size}
					height={size}
					className="block rotate-[-90deg]"
				>
					<defs>
						<mask id={maskId}>
							<circle
								cx={cx}
								cy={cy}
								r={r}
								fill="none"
								stroke="#fff"
								strokeWidth={stroke}
								strokeLinecap="round" // Always round cap for the progress
								strokeDasharray={c}
								strokeDashoffset={dashOffset}
								className={
									animate
										? "transition-[stroke-dashoffset] duration-[1.5s] ease-out"
										: ""
								}
							/>
						</mask>
					</defs>

					{/* Track (background ring) */}
					<circle
						cx={cx}
						cy={cy}
						r={r}
						fill="none"
						stroke="#E2E8F0"
						strokeWidth={stroke}
					/>

					{/* Gradient Ring (via foreignObject masked) - Only show if not fully clear to avoid overlap issues if wanted, but here assumes gradient is desired always for progress */}
					{/* If cleared, we can switch to solid color or keep gradient. User asked for conic gradient. Let's keep it. */}

					{isClear ? (
						<circle
							cx={cx}
							cy={cy}
							r={r}
							fill="none"
							stroke="#10B981" // Solid green on clear if preferred, or keep gradient
							strokeWidth={stroke}
						/>
					) : (
						<foreignObject
							x="0"
							y="0"
							width={vb}
							height={vb}
							mask={`url(#${maskId})`}
						>
							<div
								style={{
									width: "100%",
									height: "100%",
									background:
										"conic-gradient(from 180deg, #10B981 0%, #34D399 50%, #10B981 100%)",
								}}
							/>
						</foreignObject>
					)}
				</svg>

				{/* center text */}
				<div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-1">
					{isClear ? (
						<p className="text-[20px] font-medium leading-none text-text mt-1">
							クリア！
						</p>
					) : (
						<p className="text-[16px] font-medium text-text mb-1">{label}</p>
					)}

					<div className="flex items-baseline">
						<p className="text-[42px] font-bold leading-none text-text tracking-tight">
							{value}
						</p>
						<span className="text-[16px] font-bold text-text ml-1">回</span>
					</div>

					<p className="text-sm text-placeholder font-medium mt-1">/ {max}</p>
				</div>

				{isClear && (
					<div
						className={[
							"absolute left-1/2 -translate-x-1/2 -translate-y-1/2",
							"w-[60px] h-[60px] rounded-full bg-[#10B981] shadow-lg shadow-emerald-200",
							"flex items-center justify-center",
							"transition-all duration-500 ease-out",
							justCleared ? "scale-110 opacity-100" : "scale-100 opacity-100",
							"z-20 top-0",
						].join(" ")}
					>
						<CheckIcon
							sx={{
								fontSize: 40,
								color: "#ffffff",
								stroke: "#ffffff",
								strokeWidth: 2,
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
