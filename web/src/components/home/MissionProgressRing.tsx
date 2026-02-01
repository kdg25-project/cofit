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
    stroke = 12,
}: Props) {
    const pct = Math.max(0, Math.min(1, value / max));

    
    const vb = 120;
    const cx = vb / 2;
    const cy = vb / 2;
    const r = (vb - stroke) / 2; 
    const c = 2 * Math.PI * r;

    
    const dashOffset = c * (1 - pct);

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
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00C694 " />
                    <stop offset="100%" stopColor="#044C28" />
                    </linearGradient>
                </defs>

                {/* track */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="var(--gray-color)"
                    strokeWidth={stroke}
                />

                {/* progress */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                />
                </svg>

                {/* center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-3">
                    <p className="text-[20px] font-medium text-[var(--text-color)]">{label}</p>

                    <p className="text-[36px] font-semibold leading-none text-[var(--text-color)]">
                        {value}
                        <span className="align-baseline">回</span>
                    </p>

                    <p className="absolute top-[70%] left-[60%] text-lg text-[var(--text-color)] leading-none">
                        /{max}
                    </p>
                </div>
            </div>
        </div>
    );
}
