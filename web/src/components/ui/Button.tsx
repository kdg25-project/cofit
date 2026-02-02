"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
};

export function Button({ className, children, ...props }: Props) {
	return (
		<button
			{...props}
			className={clsx(
				"h-14 rounded-full font-semibold",
				"transition active:scale-[0.97]",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
		>
			{children}
		</button>
	);
}
