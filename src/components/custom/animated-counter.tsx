'use client';

import React from 'react';

type AnimatedCounterProps = {
  value: number;
  label: string;
};

export const AnimatedCounter = ({ value, label }: AnimatedCounterProps) => {
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
    <div className="min-w-[160px] rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-3xl font-semibold text-foreground">
        {count.toLocaleString()}
      </div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
};
