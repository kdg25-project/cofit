"use client";

import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
	label?: string;
	value: number;
	max: number;
	size?: number;
	stroke?: number;
};

export function ResultProgressRing({
	value,
	max,
	size = 260,
	stroke = 30,
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

	const vb = 120;
	const cx = vb / 2;
	const cy = vb / 2;
	const r = (vb - stroke) / 2;
	const c = 2 * Math.PI * r;
	const topPct = 50 - (r / vb) * 100;

	const gradId = useMemo(
		() => `ringGrad-result-${size}-${stroke}`,
		[size, stroke],
	);

	const targetDashOffset = isClear ? 0 : c * (1 - pct);
	const [dashOffset, setDashOffset] = useState(c);

	useEffect(() => {
		let raf: number;
		const t = setTimeout(() => {
			setDashOffset(c);
			raf = requestAnimationFrame(() => setDashOffset(targetDashOffset));
		}, 0);
		return () => {
			clearTimeout(t);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [c, targetDashOffset]);

	return (
		<div className="w-full flex justify-center">
			<div className="relative" style={{ width: size, height: size }}>
				<svg
					viewBox={`0 0 ${vb} ${vb}`}
					width={size}
					height={size}
					className="block"
				>
					<defs>
						<linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#00C694" />
							<stop offset="100%" stopColor="#044C28" />
						</linearGradient>
					</defs>

					<circle
						cx={cx}
						cy={cy}
						r={r}
						fill="none"
						stroke="#D9D9D9"
						strokeWidth={stroke}
					/>

					<circle
						cx={cx}
						cy={cy}
						r={r}
						fill="none"
						stroke={isClear ? "#00C694" : `url(#${gradId})`}
						strokeWidth={stroke}
						strokeLinecap={isClear ? "butt" : "round"}
						strokeDasharray={c}
						strokeDashoffset={dashOffset}
						transform={`rotate(-90 ${cx} ${cy})`}
						className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
					/>
				</svg>

				<div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-3 text-center">
					<p className="text-[45px] font-semibold leading-none text-text">
						{value}回
					</p>

					<p className="absolute top-[65%] left-[55%] text-lg text-text leading-none">
						/ {max}
					</p>
				</div>

				{isClear && (
					<div
						className={[
							"absolute left-1/2 -translate-x-1/2 -translate-y-1/2",
							"w-[70px] h-[70px] rounded-full bg-emerald-400 shadow-md",
							"flex items-center justify-center",
							"transition-transform transition-opacity duration-300 ease-out",
							justCleared ? "scale-110 opacity-100" : "scale-100 opacity-100",
							"z-20",
						].join(" ")}
						style={{ top: `${topPct}%` }}
					>
						<CheckIcon sx={{ fontSize: 70, color: "#ffffff" }} />
					</div>
				)}
			</div>
		</div>
	);
}
