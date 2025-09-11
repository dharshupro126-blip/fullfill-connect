'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/custom/animated-counter';
import Lottie from 'lottie-react';
import animationData from '@/lib/food-movement-lottie.json';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
       <header className="w-full py-10 bg-gradient-to-br from-background to-slate-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-secondary md:text-5xl font-headline">
                Welcome to{' '}
                <span className="text-primary">FullFill Connect</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground mx-auto md:mx-0">
                Your central hub for connecting surplus food with communities
                in need. Together, we can fight hunger and reduce food waste.
              </p>

              <div className="mt-8 flex gap-4 justify-center md:justify-start">
                <Link href="/donate" passHref>
                    <Button size="lg">
                      Donate Food
                    </Button>
                </Link>
                <Link href="/find-food" passHref>
                    <Button
                      variant="outline"
                      size="lg"
                    >
                      Find Food
                    </Button>
                </Link>
              </div>

              
            </div>

            <div className="flex justify-center">
              <div className="flex h-64 w-96 items-center justify-center rounded-2xl">
                 <Lottie animationData={animationData} loop={true} />
              </div>
            </div>
          </div>
           <div className="mt-16 flex flex-wrap gap-8 justify-center">
                <AnimatedCounter value={12503} label="Meals Donated" />
                <AnimatedCounter value={89} label="Communities Served" />
                <AnimatedCounter value={214} label="Volunteers Active" />
              </div>
        </div>
      </header>
    </div>
  );
}
