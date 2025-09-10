import { cn } from '@/lib/utils';

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('size-6', className)}
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" fill="hsl(var(--primary))" stroke="none" />
    <path
      d="M12 15a6 6 0 0 0 6-6h-3a3 3 0 0 0-3 3V8a3 3 0 0 0-3 3h2a1 1 0 0 0 1-1z"
      fill="white"
      stroke="white"
      strokeWidth={0.5}
    />
  </svg>
);
