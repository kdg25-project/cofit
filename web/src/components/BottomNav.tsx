"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiHome, mdiTimer, mdiWeb } from "@mdi/js";

const items = [
  { href: "/", label: "ホーム", icon: mdiHome },
  { href: "/record", label: "計測", icon: mdiTimer },
  { href: "/community", label: "コミュニティ", icon: mdiWeb },
];

const GLASS_W = 110;
const STORAGE_KEY = "bottomnav_glassX";

export function BottomNav() {
    const pathname = usePathname();

    const routeIndex = useMemo(() => {
        const i = items.findIndex(({ href }) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href)
        );
        return i === -1 ? 0 : i;
    }, [pathname]);

    const [uiIndex, setUiIndex] = useState(routeIndex);
    useLayoutEffect(() => {
        setUiIndex(routeIndex);
    }, [routeIndex]);

    const ulRef = useRef<HTMLUListElement | null>(null);
    const [colW, setColW] = useState<number>(0);
    const [readyOnce, setReadyOnce] = useState(false);

    
    const initialGlassStyle = useMemo(() => {
        const centerPct = (uiIndex + 0.5) / 3; // 0~1
        return { left: `${centerPct * 100}%` };
    }, [uiIndex]);

    
    const [glassX, setGlassX] = useState<number | null>(null);
    const [hydrated, setHydrated] = useState(false);

  
    useLayoutEffect(() => {
        setHydrated(true);
        const saved = window.sessionStorage.getItem(STORAGE_KEY);
        const n = saved ? Number(saved) : NaN;
        if (Number.isFinite(n)) setGlassX(n);
    }, []);


    useLayoutEffect(() => {
        const el = ulRef.current;
        if (!el) return;

        const update = () => {
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

 
    useLayoutEffect(() => {
        if (!readyOnce || colW === 0) return;

        const centerX = colW * (uiIndex + 0.5);
        const leftX = Math.round(centerX - GLASS_W / 2);

        setGlassX(leftX);
        window.sessionStorage.setItem(STORAGE_KEY, String(leftX));
    }, [uiIndex, colW, readyOnce]);

    const [enableAnim, setEnableAnim] = useState(false);
    useLayoutEffect(() => {
        if (!readyOnce) return;
        requestAnimationFrame(() => setEnableAnim(true));
    }, [readyOnce]);

    return (
        <nav className="fixed inset-x-0 z-50 bottom-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[420px]">
            <div className="h-[64px] rounded-full bg-[var(--base-color)] border border-white/40 shadow-lg flex items-center">
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

                {items.map(({ href, label, icon }, index) => {
                const active = routeIndex === index;
                const iconColor = active
                    ? "var(--primary-color)"
                    : "rgba(0,0,0,0.6)";

                return (
                    <li key={href} className="relative flex justify-center">
                        <Link
                            href={href}
                            onPointerDown={() => setUiIndex(index)}
                            className="relative z-10 flex flex-col items-center justify-center h-[64px] w-full"
                        >
                            <Icon path={icon} size={1.7} color={iconColor} />
                            <span
                                className={`text-[12px] leading-[1] ${
                                    active ? "text-[var(--primary-color)]" : "text-black"
                                }`}
                                >
                                {label}
                            </span>
                        </Link>
                    </li>
                );
                })}
            </ul>
        </div>
        </div>
    </nav>
    );
}
