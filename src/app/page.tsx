'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/custom/animated-counter';
import Link from 'next/link';
import { Apple, Leaf, HeartHandshake } from 'lucide-react';


const FloatingIcon = ({ icon, className, delay, duration }: { icon: React.ElementType, className: string, delay: number, duration: number }) => {
  const Icon = icon;
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: [0, -20, 0],
        opacity: [0, 0.7, 0]
      }}
      transition={{
        delay,
        duration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      <Icon className="h-full w-full" />
    </motion.div>
  );
};


export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
       <header className="relative w-full py-10 bg-gradient-to-br from-background to-slate-50 overflow-hidden">
       
        <div className="mx-auto max-w-7xl px-4 z-10">
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

            <div className="relative flex justify-center h-64 w-96">
                <FloatingIcon icon={HeartHandshake} className="w-20 h-20 text-primary/30 top-0 left-20" delay={0} duration={8} />
                <FloatingIcon icon={Leaf} className="w-16 h-16 text-accent/40 top-1/2 left-10" delay={2} duration={10} />
                <FloatingIcon icon={Apple} className="w-12 h-12 text-primary/20 top-1/4 right-20" delay={1} duration={7} />
                <FloatingIcon icon={HeartHandshake} className="w-10 h-10 text-accent/30 bottom-0 right-10" delay={3} duration={9} />
                 <FloatingIcon icon={Leaf} className="w-24 h-24 text-primary/20 top-10 right-0" delay={0.5} duration={12} />
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
