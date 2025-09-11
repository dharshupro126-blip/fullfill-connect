
'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/custom/animated-counter';
import Link from 'next/link';
import { Apple, HeartHandshake, Leaf } from 'lucide-react';


export default function HomePage() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const floatingIconVariants = (delay: number, duration: number) => ({
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        delay,
        duration,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col">
       <header className="relative w-full py-10 bg-gradient-to-br from-background to-slate-50 overflow-hidden">
       
        <div className="mx-auto max-w-7xl px-4 z-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <motion.div 
              className="text-center md:text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-4xl font-bold text-secondary md:text-5xl font-headline"
                variants={itemVariants}
              >
                Connecting Surplus,
                <br />
                <span className="text-primary">Nourishing Communities</span>
              </motion.h1>
              <motion.p 
                className="mt-4 max-w-2xl text-lg text-muted-foreground mx-auto md:mx-0"
                variants={itemVariants}
              >
                Your central hub for linking surplus food with those who need it most. Together, we can combat hunger and reduce waste.
              </motion.p>

              <motion.div 
                className="mt-8 flex gap-4 justify-center md:justify-start"
                variants={itemVariants}
              >
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
              </motion.div>

              
            </motion.div>

            <div className="relative hidden h-80 w-full items-center justify-center md:flex">
              <motion.div
                variants={floatingIconVariants(0, 4)}
                initial="initial"
                animate="animate"
                className="absolute top-10 left-20 text-green-400"
              >
                <Leaf size={64} strokeWidth={1.5} />
              </motion.div>
              <motion.div
                variants={floatingIconVariants(0.5, 3.5)}
                initial="initial"
                animate="animate"
                className="absolute top-32 right-16 text-red-400"
              >
                <Apple size={80} strokeWidth={1.5} />
              </motion.div>
              <motion.div
                variants={floatingIconVariants(1, 5)}
                initial="initial"
                animate="animate"
                className="absolute bottom-12 left-24 text-yellow-400"
              >
                <HeartHandshake size={72} strokeWidth={1.5} />
              </motion.div>
                 <motion.div
                variants={floatingIconVariants(1.5, 4.5)}
                initial="initial"
                animate="animate"
                className="absolute bottom-24 right-32 text-blue-300"
              >
                <Leaf size={48} strokeWidth={1.5} />
              </motion.div>
            </div>
          </div>
           <motion.div 
            className="mt-16 flex flex-wrap gap-8 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
           >
                <AnimatedCounter value={12503} label="Meals Donated" />
                <AnimatedCounter value={89} label="Communities Served" />
                <AnimatedCounter value={214} label="Volunteers Active" />
              </motion.div>
        </div>
      </header>
    </div>
  );
}
