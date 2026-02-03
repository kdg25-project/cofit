"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

type Props = {
	children: ReactNode;
	className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SecondaryButton({ children, className, ...props }: Props) {
	return (
		<Button
			{...props}
			className={clsx("bg-secondary text-text2", "hover:opacity-90", className)}
		>
			{children}
		</Button>
	);
}
