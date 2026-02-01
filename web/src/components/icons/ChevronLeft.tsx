type Props = {
  className?: string;
};

export function ChevronLeft({ className }: Props) {
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
        d="M25.0016 16.7181C25.3753 16.3269 26 16.3269 26.3737 16.7181C26.7241 17.0849 26.7241 17.6623 26.3737 18.029L21.6246 23L26.3737 27.971C26.7241 28.3377 26.7241 28.9152 26.3737 29.2819C26 29.6731 25.3753 29.6731 25.0016 29.2819L19 23L25.0016 16.7181Z"
        fill="currentColor"
      />
    </svg>
  );
}
