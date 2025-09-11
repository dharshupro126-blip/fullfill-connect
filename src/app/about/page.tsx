
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building, Mail, Phone, Info } from "lucide-react";
import { AnimatedCounter } from "@/components/custom/animated-counter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function AboutPage() {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
        className: 'bg-primary text-primary-foreground',
    });
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* About Us Section */}
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
             <div className="bg-muted p-12 text-center">
                <CardTitle className="font-headline text-4xl">About FullFill Connect</CardTitle>
                <CardDescription className="mt-2 text-lg max-w-3xl mx-auto">
                    Our mission is simple: to bridge the gap between food surplus and community need. We leverage technology to create an efficient, reliable, and scalable platform for food donation and distribution.
                </CardDescription>
             </div>
            <CardContent className="p-8 md:p-10">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <AnimatedCounter value={12503} className="text-4xl font-bold text-primary" />
                        <p className="mt-1 text-muted-foreground font-semibold">Meals Donated</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <AnimatedCounter value={89} className="text-4xl font-bold text-primary" />
                        <p className="mt-1 text-muted-foreground font-semibold">Communities Served</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <AnimatedCounter value={214} className="text-4xl font-bold text-primary" />
                        <p className="mt-1 text-muted-foreground font-semibold">Active Volunteers</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Contact Us Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-3xl">Get in Touch</CardTitle>
                <CardDescription>Have questions? We'd love to hear from you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help?" required />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Contact Information</CardTitle>
                        <CardDescription>Find us at our headquarters or reach out directly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <Building className="w-6 h-6 text-primary" />
                            <span>123 FoodSave Lane, Nourish City, 45678</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone className="w-6 h-6 text-primary" />
                            <span>(123) 456-7890</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Mail className="w-6 h-6 text-primary" />
                            <span>contact@fullfillconnect.org</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
