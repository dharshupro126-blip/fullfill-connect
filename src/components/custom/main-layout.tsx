
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartHandshake,
  Home,
  PackageSearch,
  Truck,
  FileText
} from 'lucide-react';
import { Logo } from './logo';
import { Button } from '../ui/button';
import { useFcm } from '@/hooks/use-fcm';
import { AnimatePresence, motion } from 'framer-motion';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // In a real app, you would get the user's UID after they log in.
  // For this example, we'll use a hardcoded ID.
  const volunteerId = 'jane-doe-volunteer-id'; // Replace with dynamic user ID
  useFcm(volunteerId);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/donate', label: 'Donate Food', icon: HeartHandshake },
    { href: '/find-food', label: 'Find Food', icon: PackageSearch },
    { href: '/deliveries', label: 'Deliveries', icon: Truck },
    { href: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-headline font-semibold">
              FullFill Connect
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <div className="flex items-center gap-2">
             <Link href="/login" passHref>
               <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/get-started" passHref>
               <Button>Get Started</Button>
            </Link>
          </div>
        </header>
        <AnimatePresence mode="wait">
           <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
      </SidebarInset>
    </SidebarProvider>
  );
}
