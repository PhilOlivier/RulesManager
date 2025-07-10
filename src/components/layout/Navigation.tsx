'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import QDEXLogo from '@/assets/QDEX-logo-purple.svg';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/protected-routes/test-scenarios', label: 'Scenarios' },
  { href: '/protected-routes/rules', label: 'Rules' },
];

const EnvironmentToggle = () => {
  const { environment, setEnvironment } = useEnvironment();

  const handleToggle = (checked: boolean) => {
    setEnvironment(checked ? 'UAT' : 'PROD');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="environment-switch">PROD</Label>
      <Switch
        id="environment-switch"
        checked={environment === 'UAT'}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="environment-switch">UAT</Label>
    </div>
  );
};

const Navigation = () => {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center pl-4">
        <div className="mr-4 hidden md:flex md:flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src={QDEXLogo} alt="QDEX Logo" width={24} height={24} />
            <span className="hidden font-bold text-xl sm:inline-block">
              Rules Builder
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-semibold transition-colors hover:text-foreground/80 ${
                    isActive 
                      ? 'text-foreground border-b-2 border-primary pb-1' 
                      : 'text-foreground/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden md:flex items-center justify-end gap-4">
          <EnvironmentToggle />
          {user && (
            <Button variant="outline" size="sm" onClick={signOut} disabled={loading}>
              Logout
            </Button>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/protected-routes/test-scenarios" className="flex items-center space-x-2">
                    <Image src={QDEXLogo} alt="QDEX Logo" width={24} height={24} />
                    <span className="font-bold text-xl">Rules Builder</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`font-semibold transition-colors hover:text-foreground/80 ${
                        isActive 
                          ? 'text-foreground border-l-2 border-primary pl-2' 
                          : 'text-foreground/60'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="pt-4">
                  <EnvironmentToggle />
                </div>
                {user && (
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={signOut}
                      disabled={loading}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation; 