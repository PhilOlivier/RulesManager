'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, SquareKanban } from 'lucide-react';
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

const navItems = [
  { href: '/test-scenarios', label: 'Scenarios' },
  { href: '/lender-settings', label: 'Lender Settings' },
  { href: '/rules', label: 'Rules' },
  { href: '/results', label: 'Results' },
];

const EnvironmentToggle = () => {
  const { environment, setEnvironment } = useEnvironment();

  const handleToggle = (checked: boolean) => {
    setEnvironment(checked ? 'UAT' : 'MVP');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="environment-switch">MVP</Label>
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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex md:flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <SquareKanban className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Rules Builder
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-semibold text-foreground transition-colors hover:text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex justify-end">
          <EnvironmentToggle />
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
                  <Link href="/" className="flex items-center space-x-2">
                    <SquareKanban className="h-6 w-6" />
                    <span className="font-bold">Rules Builder</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-semibold text-foreground transition-colors hover:text-foreground/80"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4">
                  <EnvironmentToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation; 