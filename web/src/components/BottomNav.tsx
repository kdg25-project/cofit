"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import {
	DEFAULT_EXERCISE_MODE,
	EXERCISES,
	type ExerciseMode,
} from "@/lib/exercises";

const HIDE_NAV = [
	"/login",
	"/sign-up",
	"/record",
	"/result",
	"/profile",
	"/onboarding",
];

const items = [
	{ href: "/", label: "ホーム", Icon: HomeRoundedIcon },
	{ href: "/record", label: "計測", Icon: TimerRoundedIcon },
	{ href: "/community", label: "コミュニティ", Icon: LanguageRoundedIcon },
];

const GLASS_W = 110;
const STORAGE_KEY = "bottomnav_glassX";

export function BottomNav() {
	const router = useRouter();
	const pathname = usePathname();
	const hide = HIDE_NAV.some((p) =>
		p === "/" ? pathname === "/" : pathname.startsWith(p),
	);

	const routeIndex = useMemo(() => {
		const i = items.findIndex(({ href }) =>
			href === "/" ? pathname === "/" : pathname.startsWith(href),
		);
		return i === -1 ? 0 : i;
	}, [pathname]);

	const [uiIndex, setUiIndex] = useState(routeIndex);
	const [isRecordOpen, setIsRecordOpen] = useState(false);
	const [selectedMode, setSelectedMode] = useState<ExerciseMode>(
		DEFAULT_EXERCISE_MODE,
	);
	const [prevRouteIndex, setPrevRouteIndex] = useState(routeIndex);
	if (routeIndex !== prevRouteIndex) {
		setPrevRouteIndex(routeIndex);
		setUiIndex(routeIndex);
	}

	const ulRef = useRef<HTMLUListElement | null>(null);
	const [colW, setColW] = useState<number>(0);
	const [readyOnce, setReadyOnce] = useState(false);

	const initialGlassStyle = useMemo(() => {
		const centerPct = (uiIndex + 0.5) / 3;
		return { left: `${centerPct * 100}%` };
	}, [uiIndex]);

	const [glassX, setGlassX] = useState<number | null>(null);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		requestAnimationFrame(() => {
			setHydrated(true);
			const saved = window.sessionStorage.getItem(STORAGE_KEY);
			const n = saved ? Number(saved) : NaN;
			if (Number.isFinite(n)) setGlassX(n);
		});
	}, []);

	useLayoutEffect(() => {
		const el = ulRef.current;
		if (!el) return;

		const update = () => {
			if (!el) return;
			const w = el.getBoundingClientRect().width;
			if (w > 0) {
				setColW(w / 3);
				setReadyOnce(true);
			}
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	if (readyOnce && colW !== 0) {
		const centerX = colW * (uiIndex + 0.5);
		const leftX = Math.round(centerX - GLASS_W / 2);
		if (glassX !== leftX) {
			setGlassX(leftX);
			window.sessionStorage.setItem(STORAGE_KEY, String(leftX));
		}
	}

	const [enableAnim, setEnableAnim] = useState(false);
	useLayoutEffect(() => {
		if (!readyOnce) return;
		requestAnimationFrame(() => setEnableAnim(true));
	}, [readyOnce]);

	if (hide) return null;

	return (
		<>
			<nav className="fixed inset-x-0 z-50 bottom-[calc(env(safe-area-inset-bottom)+16px)]">
				<div className="mx-auto w-[calc(100%-32px)] max-w-[420px]">
					<div className="h-[64px] rounded-full bg-base border border-white/40 shadow-lg flex items-center">
						<ul ref={ulRef} className="relative grid grid-cols-3 w-full">
							<span
								className="
                        pointer-events-none absolute top-1/2
                        w-[110px] h-[60px] -translate-y-1/2
                        rounded-full bg-white/80 backdrop-blur-xl
                        shadow-[inset_0_4px_50px_rgba(0,0,0,0.25)]
                        ring-[0.5px] ring-white/70 will-change-transform
                    "
								style={
									!readyOnce || glassX === null
										? {
												...initialGlassStyle,
												transform: "translate3d(-50%, 0, 0)",
												opacity: 1,
												transition: "none",
											}
										: {
												left: 0,
												transform: `translate3d(${glassX}px, 0, 0)`,
												opacity: 1,
												transition: enableAnim
													? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)"
													: "none",
											}
								}
								data-hydrated={hydrated ? "1" : "0"}
							/>

							{items.map(({ href, label, Icon }, index) => {
								const active = routeIndex === index;
								const iconColor = active
									? "var(--color-primary)"
									: "var(--color-text)";
								const isRecord = href === "/record";

								return (
									<li key={href} className="relative flex justify-center">
										{isRecord ? (
											<button
												type="button"
												onClick={() => {
													setUiIndex(index);
													setIsRecordOpen(true);
												}}
												className="relative z-10 flex flex-col items-center justify-center h-[64px] w-full"
											>
												<Icon sx={{ fontSize: 28, color: iconColor }} />
												<span
													className={`text-[12px] leading-[1] ${
														active ? "text-primary" : "text-black"
													}`}
												>
													{label}
												</span>
											</button>
										) : (
											<Link
												href={href}
												onPointerDown={() => setUiIndex(index)}
												className="relative z-10 flex flex-col items-center justify-center h-[64px] w-full"
											>
												<Icon sx={{ fontSize: 28, color: iconColor }} />
												<span
													className={`text-[12px] leading-[1] ${
														active ? "text-primary" : "text-black"
													}`}
												>
													{label}
												</span>
											</Link>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</nav>

			{isRecordOpen ? (
				<div className="fixed inset-0 z-[60]">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						onClick={() => setIsRecordOpen(false)}
						aria-label="閉じる"
					/>
					<div className="absolute inset-x-0 bottom-0">
						<div className="mx-auto w-full max-w-[420px] rounded-t-[20px] bg-base px-6 pt-5 pb-[calc(28px+env(safe-area-inset-bottom))] shadow-2xl">
							<div className="flex items-center justify-center relative">
								<h2 className="text-xl text-text">種目選択</h2>
								<button
									type="button"
									onClick={() => setIsRecordOpen(false)}
									className="absolute right-0 h-8 w-8 rounded-full flex items-center justify-center text-text"
									aria-label="閉じる"
								>
									<CloseRoundedIcon sx={{ fontSize: 30 }} />
								</button>
							</div>

							<p className="mt-3 flex items-center justify-center text-lg text-text">
								運動する種目を選択してください。
							</p>

							<div className="mt-8 flex items-start justify-start gap-3">
								{EXERCISES.map((exercise) => (
									<Chip
										key={exercise.mode}
										type="button"
										selected={selectedMode === exercise.mode}
										onClick={() => setSelectedMode(exercise.mode)}
									>
										{exercise.label}
									</Chip>
								))}
							</div>

							<div className="mt-6 flex justify-center">
								<SecondaryButton
									type="button"
									onClick={() => {
										setIsRecordOpen(false);
										router.push(`/record?mode=${selectedMode}`);
									}}
									className="w-[322px] bg-text"
								>
									開始する
								</SecondaryButton>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
