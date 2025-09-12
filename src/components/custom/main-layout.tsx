
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
import { usePathname, useRouter } from 'next/navigation';
import {
  HeartHandshake,
  Home,
  PackageSearch,
  Truck,
  FileText,
  Info,
  LogOut,
} from 'lucide-react';
import { Logo } from './logo';
import { Button } from '../ui/button';
import { useFcm } from '@/hooks/use-fcm';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth-context';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // In a real app, you would get the user's UID after they log in.
  // For this example, we'll use a hardcoded ID.
  const volunteerId = user ? user.uid : null; // Use real user ID
  useFcm(volunteerId);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/donate', label: 'Donate Food', icon: HeartHandshake },
    { href: '/find-food', label: 'Find Food', icon: PackageSearch },
    { href: '/deliveries', label: 'Deliveries', icon: Truck },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/about', label: 'About & Contact', icon: Info },
  ];

  const handleLogout = async () => {
    const auth = getAuth(firebaseApp);
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred during logout. Please try again.',
      });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-headline font-semibold">
              FullFill
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
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                <LogOut />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <div className="flex items-center gap-2">
            {!loading && !user && (
              <>
                <Link href="/login" passHref>
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/get-started" passHref>
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
             {user && (
              <span className="text-sm text-muted-foreground">
                Welcome, {user.displayName || user.email}
              </span>
            )}
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
