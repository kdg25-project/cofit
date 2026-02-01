type Props = {
  className?: string;
};

export function ChevronRight({ className }: Props) {
  return (
    <svg
      viewBox="0 0 46 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.9984 16.7181C20.6247 16.3269 20 16.3269 19.6263 16.7181C19.2759 17.0849 19.2759 17.6623 19.6263 18.029L24.3754 23L19.6263 27.971C19.2759 28.3377 19.2759 28.9152 19.6263 29.2819C20 29.6731 20.6247 29.6731 20.9984 29.2819L27 23L20.9984 16.7181Z"
        fill="currentColor"
      />
    </svg>
  );
}
