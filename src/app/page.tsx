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
       <header className="w-full py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl font-headline">
                Welcome to{' '}
                <span className="text-primary">FullFill Connect</span>
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Your central hub for connecting surplus food with communities
                in need. Together, we can fight hunger and reduce food waste.
              </p>

              <div className="mt-4 flex gap-3">
                <Link href="/donate" passHref>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="rounded-xl px-5 py-2 shadow-md">
                      Donate Food
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/find-food" passHref>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="rounded-xl border-gray-200 bg-white px-5 py-2"
                    >
                      Find Food
                    </Button>
                  </motion.div>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <AnimatedCounter value={12503} label="Meals Donated" />
                <AnimatedCounter value={89} label="Communities Served" />
                <AnimatedCounter value={214} label="Volunteers Active" />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex h-48 w-72 items-center justify-center rounded-2xl bg-secondary">
                 <Lottie animationData={animationData} loop={true} />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
