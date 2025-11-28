import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Shield, 
  Grid, 
  LogOut, 
  Settings, 
  Bell,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const NavItem = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm cursor-pointer transition-colors ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
          {icon}
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-background border-r border-secondary">
      <div className="p-6 border-b border-secondary">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-mono font-bold text-sm text-white">VELON<span className="text-primary">ID</span></span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        <NavItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" />
        <NavItem href="/dashboard/security" icon={<Shield className="w-4 h-4" />} label="Security" />
        <NavItem href="/dashboard/apps" icon={<Grid className="w-4 h-4" />} label="Apps" />
      </div>
      
      <div className="p-4 border-t border-secondary">
        <Link href="/login">
          <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="hidden md:block w-56 fixed inset-y-0 z-30">
        <SidebarContent />
      </div>

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="h-16 border-b border-secondary sticky top-0 z-20 px-6 flex items-center justify-between bg-background/50 backdrop-blur-sm">
          <div className="md:hidden">
             <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-56 border-r border-secondary bg-background">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-secondary">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium leading-none">Alice Chen</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">VID-8842-9912</p>
              </div>
              <Avatar className="h-8 w-8 border border-secondary">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
