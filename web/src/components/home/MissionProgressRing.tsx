import { useEffect, useMemo, useState, useRef } from "react";
import CheckIcon from "@mui/icons-material/Check";


type Props = {
	label: string;
	value: number;
	max: number;
	size?: number;
	stroke?: number;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) {
    if (typeof document == "undefined") return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}


export function MissionProgressRing({
	label,
	value,
	max,
	size = 212,
	stroke = 12,
}: Props) {
    const safeMax = Math.max(1, max);
	const pct = Math.max(0, Math.min(1, value / safeMax));
    const isClear = value >= safeMax;

    const prevClear = useRef(false);
    const [justCleared, setJustCleared] = useState(false);

    useEffect(() => {
        if (!prevClear.current && isClear) {
            setJustCleared(true);
            const t = setTimeout(() => setJustCleared(false), 500);
            prevClear.current = true;
            return () => clearTimeout(t);
        }
        if (!isClear) prevClear.current = false;
    },[isClear]);

	const vb = 120;
	const cx = vb / 2;
	const cy = vb / 2;
	const r = (vb - stroke) / 2;
	const c = 2 * Math.PI * r;
    const topPct = 50 - (r / vb) * 100; 

    const cookieKey = "cofit_mission_ring_intro_day";
    const targetDashOffset = isClear ? 0 : c * (1-pct);
    const [dashOffset, setDashOffset] = useState(targetDashOffset);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().slice(0,10);
        const seenDate = getCookie(cookieKey);
        if (seenDate !== today) {
            setCookie(cookieKey, today, 60 * 60 * 24 * 7);
            setAnimate(true);
            setDashOffset(c);
            const raf = requestAnimationFrame(() => {
                setDashOffset(targetDashOffset);
            });
            return ()  => cancelAnimationFrame(raf);
        } else {
            setAnimate(false);
            setDashOffset(targetDashOffset);
        }
    },[]);

    useEffect(() => {
        const today = new Date().toISOString().slice(0,10);
        const seenDate = getCookie(cookieKey);

        if (seenDate === today) {
            setDashOffset(targetDashOffset);
        }
    },[targetDashOffset]);

    const gradId = useMemo(
        () => `ringGrad-${label.replace(/\s+/g, "")}-${size}-${stroke}`,
        [label, size, stroke]
    );
    const clearGradId = useMemo(
        () => `ringClearGrad-${label.replace(/\s+/g, "")}-${size}-${stroke}`,
        [label, size, stroke]
    );

    const ringStroke = isClear ? "#00C694" : `url(#${gradId})`; 


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

					{/* track */}
					<circle
						cx={cx}
						cy={cy}
						r={r}
						fill="none"
						stroke="#D9D9D9"
						strokeWidth={stroke}
					/>

					{/* progress */}
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
                        className={
                            animate 
                                ? "transition-[stroke-dashoffset,stroke] duration-700 ease-out"
                                : "transition-none"
                        }
					/>
				</svg>

				{/* center text */}
				<div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-3">
                    {isClear ? (
                        <p className="text-[20px] font-medium leading-none text-text mt-1">
                            クリア！
                        </p>
                    ) : (
                        <p className="text-[20px] font-medium text-text">{label}</p>

                    )}

                    <p className="text-[36px] font-semibold leading-none text-text">
                        {value}
                        <span className="align-baseline">回</span>
                    </p>

					<p className="absolute top-[70%] left-[60%] text-lg text-text leading-none">
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
                    style={{
                    top: `${topPct}%`,
                    }}
                >
                    <CheckIcon
                        sx={{
                            fontSize: 70,
                            color: "#ffffff",
                        }}
                    />
                </div>
                )}
			</div>
		</div>
	);
}
