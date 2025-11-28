import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-secondary bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-sm text-white tracking-wide">VELON<span className="text-primary">ID</span></span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:block">Docs</Link>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:block">Support</a>
          <Link href="/login">
            <Button variant="ghost" className="text-xs">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9">Get V-ID</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
