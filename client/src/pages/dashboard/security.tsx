import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, Key, Fingerprint, Smartphone, Mail, Lock,
  CheckCircle, AlertTriangle, Clock, MapPin, Monitor,
  Trash2, Eye, EyeOff
} from "lucide-react";
import { useState } from "react";

export default function DashboardSecurity() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground mt-1">Manage your account security and authentication methods</p>
        </div>

        {/* Security Score */}
        <Card className="border-secondary bg-gradient-to-r from-green-500/10 to-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Security Score</div>
                  <div className="text-4xl font-bold text-green-400">98%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-medium">Excellent Protection</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Methods */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Authentication Methods
            </CardTitle>
            <CardDescription>Configure how you sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuthMethodItem 
              icon={<Mail className="w-5 h-5" />}
              title="Email & Password"
              description="Sign in with your email address"
              enabled={true}
              primary={true}
            />
            <AuthMethodItem 
              icon={<Fingerprint className="w-5 h-5" />}
              title="Passkey"
              description="Use biometrics or security key"
              enabled={false}
              action={<Button size="sm" variant="outline">Set Up</Button>}
            />
            <AuthMethodItem 
              icon={<Smartphone className="w-5 h-5" />}
              title="Wallet (SIWE)"
              description="Sign in with Ethereum wallet"
              enabled={false}
              action={<Button size="sm" variant="outline">Connect</Button>}
            />
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-secondary/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-sm text-muted-foreground">Use Google Authenticator or similar</div>
                </div>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-secondary/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Get notified of security events</div>
                </div>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription>Devices currently signed in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SessionItem 
              device="Chrome on Windows"
              location="San Francisco, US"
              time="Active now"
              current={true}
            />
            <SessionItem 
              device="Safari on iPhone"
              location="San Francisco, US"
              time="2 hours ago"
              current={false}
            />
          </CardContent>
        </Card>

        {/* Security Checklist */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Security Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChecklistItem text="Email verified" completed={true} />
            <ChecklistItem text="Strong password set" completed={true} />
            <ChecklistItem text="Two-factor authentication" completed={twoFactorEnabled} />
            <ChecklistItem text="Passkey configured" completed={false} />
            <ChecklistItem text="Recovery options set" completed={false} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function AuthMethodItem({ icon, title, description, enabled, primary, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  primary?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-secondary/50">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {primary && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Primary</Badge>}
          </div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      {enabled ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
      ) : (
        action
      )}
    </div>
  );
}

function SessionItem({ device, location, time, current }: {
  device: string;
  location: string;
  time: string;
  current: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-secondary/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Monitor className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{device}</span>
            {current && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Current</Badge>}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {time}
            </span>
          </div>
        </div>
      </div>
      {!current && (
        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function ChecklistItem({ text, completed }: { text: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
      )}
      <span className={completed ? 'text-white' : 'text-muted-foreground'}>{text}</span>
    </div>
  );
}
