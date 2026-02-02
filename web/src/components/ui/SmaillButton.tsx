"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

type Props = {
	children: ReactNode;
	className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SmallButton({ children, className, ...props }: Props) {
	return (
		<Button
			{...props}
			className={clsx(
				"h-12 bg-primary-color text-white text-sm",
				"hover:opacity-90",
				className,
			)}
		>
			{children}
		</Button>
	);
}
