
'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/custom/animated-counter';
import Link from 'next/link';
import Lottie from 'lottie-react';
import foodMovementAnimation from '@/lib/food-movement-lottie.json';


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
                Welcome to{' '}
                <span className="text-primary">FullFill Connect</span>
              </motion.h1>
              <motion.p 
                className="mt-4 max-w-2xl text-lg text-muted-foreground mx-auto md:mx-0"
                variants={itemVariants}
              >
                Your central hub for connecting surplus food with communities
                in need. Together, we can fight hunger and reduce food waste.
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

            <motion.div 
              className="relative flex justify-center h-64 w-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
               <Lottie animationData={foodMovementAnimation} loop={true} />
            </motion.div>
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
