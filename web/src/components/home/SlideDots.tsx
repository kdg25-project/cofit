type DotsProps = {
	count: number;
	activeIndex: number;
	onDotClick?: (i: number) => void;
};

export function SlideDots({ count, activeIndex, onDotClick }: DotsProps) {
	return (
		<div className="mt-4 flex justify-center gap-2">
			{Array.from({ length: count }).map((_, i) => {
				const isActive = i === activeIndex;
				return (
					<button
						key={i}
						type="button"
						onClick={() => onDotClick?.(i)}
						aria-label={`slide ${i + 1}`}
						className={[
							"h-2 w-2 rounded-full transition-all",
							isActive ? "bg-sub" : "bg-gray",
							onDotClick ? "cursor-pointer" : "cursor-default",
						].join(" ")}
					/>
				);
			})}
		</div>
	);
}
