import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Key, Smartphone, Fingerprint, LogOut, Clock, MapPin } from "lucide-react";

export default function DashboardSecurity() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <div className="text-muted-foreground divider-ascii text-xs mb-2">// SECURITY SETTINGS //</div>
          <h1 className="text-4xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your credentials and protection</p>
        </div>

        <div className="grid gap-6">
          {/* 2FA Section */}
          <Card className="border-secondary bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                  <CardDescription>Add extra protection to your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-secondary/50">
                <div className="space-y-1">
                  <div className="font-medium text-sm">Authenticator App</div>
                  <div className="text-xs text-muted-foreground">Google Authenticator, Authy</div>
                </div>
                <div className="flex items-center gap-2">
                   <Badge className="bg-accent/20 text-accent border-accent/20 text-xs">Enabled</Badge>
                   <Button variant="outline" size="sm" className="text-xs h-8">Configure</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-secondary/50">
                <div className="space-y-1">
                  <div className="font-medium text-sm">Hardware Key</div>
                  <div className="text-xs text-muted-foreground">YubiKey, Titan</div>
                </div>
                 <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="border-secondary bg-card">
             <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Password</CardTitle>
                  <CardDescription>Last changed 2 days ago</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label className="text-xs">Current Password</Label>
                  <Input type="password" className="bg-input border-secondary text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">New Password</Label>
                  <Input type="password" className="bg-input border-secondary text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Confirm Password</Label>
                  <Input type="password" className="bg-input border-secondary text-xs" />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9">Update</Button>
              </form>
            </CardContent>
          </Card>
          
           {/* Sessions Section */}
          <Card className="border-secondary bg-card">
             <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                  <CardDescription>Manage your connected devices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SessionItem device="MacBook Pro 16" location="San Francisco, US" active="Active now" isCurrent />
              <SessionItem device="iPhone 15 Pro" location="San Francisco, US" active="Active 5h ago" />
              <SessionItem device="Windows PC" location="Austin, US" active="Active 2d ago" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SessionItem({ device, location, active, isCurrent = false }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-secondary/50 hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <Smartphone className="w-4 h-4 text-muted-foreground" />
        <div className="text-sm">
          <div className="font-medium flex items-center gap-2">
            {device}
            {isCurrent && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">Current</span>}
          </div>
          <div className="text-xs text-muted-foreground">{location} • {active}</div>
        </div>
      </div>
      {!isCurrent && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive h-8">
          <LogOut className="w-3 h-3 mr-1" />
          Revoke
        </Button>
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
