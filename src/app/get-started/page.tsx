
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, Heart, ShoppingBasket } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const roles = [
  {
    icon: Heart,
    title: "I'm a Donor",
    description: "I have surplus food I'd like to donate to my community.",
    cta: "Start Donating",
    href: "/donate" // Or a specific donor signup page
  },
  {
    icon: Handshake,
    title: "I'm a Volunteer",
    description: "I want to help deliver food donations to those in need.",
    cta: "Become a Volunteer",
    href: "/deliveries" // Or a specific volunteer signup page
  },
  {
    icon: ShoppingBasket,
    title: "I'm a Receiver",
    description: "I am in need of food for myself or my organization.",
    cta: "Find Food",
    href: "/find-food" // Or a specific receiver signup page
  }
];

export default function GetStartedPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-4xl text-center">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <CardTitle className="font-headline text-4xl">Join the Movement</CardTitle>
            <CardDescription className="mt-2 text-lg text-muted-foreground">
                How would you like to contribute?
            </CardDescription>
        </motion.div>
        
        <motion.div 
            className="mt-10 grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {roles.map((role) => (
            <motion.div key={role.title} variants={itemVariants}>
              <Card className="flex h-full flex-col text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <role.icon className="h-8 w-8" />
                    </div>
                  <CardTitle className="mt-4 font-headline">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{role.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                    <Link href={role.href} passHref>
                        <Button className="w-full">{role.cta}</Button>
                    </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
         <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
         >
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Login
                </Link>
            </p>
        </motion.div>
      </div>
    </div>
  );
}
