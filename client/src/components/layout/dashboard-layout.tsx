import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Shield, Layers, Settings, LogOut, 
  Menu, X, ChevronDown, User, Bell
} from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLocation('/');
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
    { icon: <Shield className="w-5 h-5" />, label: 'Security', path: '/dashboard/security' },
    { icon: <Layers className="w-5 h-5" />, label: 'Connected Apps', path: '/dashboard/apps' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-secondary/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="font-bold text-lg hidden sm:block">
                  <span className="text-white">VD</span>
                  <span className="text-primary">ID</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-secondary/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">My Account</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 border-r border-secondary/50 bg-background">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                location === item.path || (item.path === '/dashboard' && location === '/dashboard')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-white hover:bg-secondary/50'
              }`}>
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary/50">
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
            <div className="text-sm font-medium mb-1">V-Score</div>
            <div className="text-2xl font-bold text-primary">830</div>
            <div className="text-xs text-muted-foreground mt-1">Top 6% of users</div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-16 bottom-0 w-64 bg-background border-r border-secondary/50 animate-in slide-in-from-left duration-200">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                      location === item.path 
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-white hover:bg-secondary/50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
