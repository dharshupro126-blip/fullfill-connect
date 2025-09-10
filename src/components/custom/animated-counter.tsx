
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type AnimatedCounterProps = {
  value: number;
  label?: string;
  className?: string;
};

export const AnimatedCounter = ({ value, label, className }: AnimatedCounterProps) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1200;
    // Calculate the increment step to make the animation smooth
    const increment = value / (duration / 16);

    const handle = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(handle);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16); // Run at approx 60fps

    return () => clearInterval(handle);
  }, [value]);

  return (
    <div>
      <div className={cn("text-3xl font-semibold text-foreground", className)}>
        {count.toLocaleString()}
      </div>
      {label && <div className="mt-1 text-sm text-muted-foreground">{label}</div>}
    </div>
  );
};
