'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors duration-200"
        >
          <Sun className="h-4 w-4" />
          <span className="font-medium">Light</span>
          {theme === 'light' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors duration-200"
        >
          <Moon className="h-4 w-4" />
          <span className="font-medium">Dark</span>
          {theme === 'dark' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors duration-200"
        >
          <Monitor className="h-4 w-4" />
          <span className="font-medium">System</span>
          {theme === 'system' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
