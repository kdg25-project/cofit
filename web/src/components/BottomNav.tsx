"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@mdi/react";
import { mdiHome, mdiTimer, mdiWeb } from "@mdi/js";

const items = [
  { href: "/", label: "ホーム", icon: mdiHome },
  { href: "/record", label: "計測", icon: mdiTimer },
  { href: "/community", label: "コミュニティ", icon: mdiWeb },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed inset-x-0 z-50 bottom-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="mx-auto w-[calc(100%-32px)] max-w-[420px]">
                <div
                className="
                    h-[64px]
                    rounded-full
                    bg-[var(--base-color)]
                    ring-[0.5px] ring-white/70
                    shadow-lg
                    flex items-center
                "
                >
                <ul className="grid grid-cols-3 w-full">
                    {items.map(({ href, label, icon }) => {
                    const active =
                        href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(href);

                    const iconColor = active
                        ? "var(--primary-color)"
                        : "rgba(0,0,0,0.6)";

                    return (
                        <li key={href} className="relative flex justify-center">
                        {active && (
                            <span
                            className="
                                pointer-events-none
                                absolute
                                left-1/2 top-1/2
                                w-[110px] h-[60px]
                                -translate-x-1/2 -translate-y-1/2
                                rounded-full
                                bg-white/80
                                backdrop-blur-xl
                                shadow-[inset_0_4px_50px_rgba(0,0,0,0.25)]
                            "
                            />
                        )}

                    
                            <Link
                                href={href}
                                className="
                                relative z-10
                                flex flex-col
                                items-center
                                justify-center
                                h-[64px]
                                "
                            >
                                <Icon path={icon} size={1.7} color={iconColor} />

                                <span
                                className={`text-[12px] leading-[1] ${
                                    active
                                    ? "text-[var(--primary-color)]"
                                    : "text-black"
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
