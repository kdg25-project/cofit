"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

type Props = {
	children: ReactNode;
	className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, className, ...props }: Props) {
	return (
		<Button
			{...props}
			className={clsx(
				"bg-primary text-text2",
				"shadow-md hover:opacity-90",
				className,
			)}
		>
			{children}
		</Button>
	);
}
