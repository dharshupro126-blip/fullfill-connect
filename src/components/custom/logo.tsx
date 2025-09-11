import { cn } from '@/lib/utils';

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={cn('size-8', className)}
    {...props}
  >
    <defs>
      <linearGradient id="circle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#F39C12' }} />
        <stop offset="100%" style={{ stopColor: 'F1C40F' }} />
      </linearGradient>
    </defs>
    
    <path
      d="M 90 50 A 40 40 0 1 1 50 10"
      fill="none"
      stroke="url(#circle-gradient)"
      strokeWidth="8"
      strokeLinecap="round"
    />
    
    <path
      d="M70 20 L90 35"
      fill="none"
      stroke="#2ECC71"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <path
      d="M75 25 C 70 30, 70 35, 75 40"
      fill="none"
      stroke="#2ECC71"
      strokeWidth="8"
    />
    
    <g transform="translate(50, 55) scale(0.4)" fill="#F39C12">
      <path
        d="M -15 -30 L -15 20 C -15 30 -5 30 0 20 L 0 20 C 5 30, 15 30, 15 20 L 15 -30"
        stroke="#F39C12"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        transform="translate(25)"
        d="M 0 -30 C 15 -30, 15 -15, 0 0 C -15 -15, -15 -30, 0 -30"
        stroke="#F39C12"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="-35" y1="0" x2="45" y2="0" stroke="#F39C12" strokeWidth="8" strokeLinecap="round" />
    </g>
  </svg>
);
