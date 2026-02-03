"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	leading?: ReactNode;
	selected?: boolean;
	className?: string;
};

export function Chip({
	children,
	leading,
	selected = false,
	className,
	...props
}: Props) {
	return (
		<button
			{...props}
			className={clsx(
				"h-[35px] px-4 rounded-[30px] border px-4 flex items-center justify-center gap-2",
				selected
					? "border-secondary bg-secondary text-text2"
					: "border-secondary bg-base text-text",
				className,
			)}
			aria-pressed={selected}
		>
			{leading ? (
				<span className="flex items-center justify-center">{leading}</span>
			) : null}
			{children}
		</button>
	);
}
