import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Wallet, Activity, Users, Clock, MapPin, 
  CheckCircle, Copy, ExternalLink, Zap, TrendingUp,
  Fingerprint, Globe, Link as LinkIcon
} from "lucide-react";
import { useState, useEffect } from "react";

interface UserData {
  vid: string;
  email: string;
  displayName?: string;
  vscoreTotal: number;
  vscoreActivity: number;
  vscoreTrust: number;
  vscoreSocial: number;
  vscoreFinancial: number;
  vscoreLevel: string;
  walletAddress?: string;
  ensName?: string;
  createdAt: string;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch user data
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('User data response:', data);
      
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const copyVID = () => {
    if (user?.vid) {
      navigator.clipboard.writeText(user.vid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 800) return { label: 'Elite', color: 'text-purple-400' };
    if (score >= 600) return { label: 'Advanced', color: 'text-blue-400' };
    if (score >= 400) return { label: 'Intermediate', color: 'text-green-400' };
    return { label: 'Beginner', color: 'text-gray-400' };
  };

  const scoreLevel = user?.vscoreLevel 
    ? { label: user.vscoreLevel, color: user.vscoreLevel === 'Elite' ? 'text-purple-400' : 'text-primary' }
    : getScoreLevel(user?.vscoreTotal || 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back to your identity hub</p>
          </div>
          <Button className="bg-primary">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>

        {/* V-ID Card */}
        <Card className="border-secondary bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">V</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">Your V-ID</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xl font-mono font-semibold text-primary">
                      {user?.vid || 'VID-XXXX-XXXX-XXXX'}
                    </code>
                    <button 
                      onClick={copyVID}
                      className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">Early Adopter</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Web3 Native</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            icon={<Activity className="w-5 h-5 text-primary" />}
            title="V-Score"
            value={user?.vscoreTotal?.toString() || '0'}
            subtitle={scoreLevel.label}
            subtitleColor={scoreLevel.color}
          />
          <StatCard 
            icon={<Shield className="w-5 h-5 text-green-500" />}
            title="Security Level"
            value="98%"
            subtitle="Excellent"
            subtitleColor="text-green-400"
          />
          <StatCard 
            icon={<LinkIcon className="w-5 h-5 text-blue-500" />}
            title="Connected Apps"
            value="4"
            subtitle="Active"
            subtitleColor="text-blue-400"
          />
          <StatCard 
            icon={<Wallet className="w-5 h-5 text-orange-500" />}
            title="Wallets"
            value={user?.walletAddress ? '1' : '0'}
            subtitle={user?.walletAddress ? 'Connected' : 'None'}
            subtitleColor={user?.walletAddress ? 'text-orange-400' : 'text-muted-foreground'}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* V-Score Breakdown */}
          <Card className="border-secondary">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                V-Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar 
                label="Activity" 
                value={user?.vscoreActivity || 0} 
                max={300} 
                color="bg-primary" 
              />
              <ScoreBar 
                label="Trust" 
                value={user?.vscoreTrust || 0} 
                max={200} 
                color="bg-green-500" 
              />
              <ScoreBar 
                label="Social" 
                value={user?.vscoreSocial || 0} 
                max={200} 
                color="bg-blue-500" 
              />
              <ScoreBar 
                label="Financial" 
                value={user?.vscoreFinancial || 0} 
                max={300} 
                color="bg-purple-500" 
              />
            </CardContent>
          </Card>

          {/* Connected Identities */}
          <Card className="border-secondary">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Connected Identities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <IdentityItem 
                icon={<Wallet className="w-5 h-5" />}
                type="Wallet"
                value={user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not connected'}
                connected={!!user?.walletAddress}
              />
              <IdentityItem 
                icon={<Globe className="w-5 h-5" />}
                type="ENS Domain"
                value={user?.ensName || 'Not linked'}
                connected={!!user?.ensName}
              />
              <IdentityItem 
                icon={<Fingerprint className="w-5 h-5" />}
                type="Passkey"
                value="Not configured"
                connected={false}
              />
              <IdentityItem 
                icon={<Users className="w-5 h-5" />}
                type="Lens Profile"
                value="Not linked"
                connected={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-secondary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem 
                action="Account Created"
                detail="Your V-ID was generated"
                time="Just now"
                icon={<CheckCircle className="w-4 h-4 text-green-500" />}
              />
              <ActivityItem 
                action="V-Score Updated"
                detail="Initial score calculated"
                time="Just now"
                icon={<TrendingUp className="w-4 h-4 text-primary" />}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, title, value, subtitle, subtitleColor }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string;
  subtitleColor: string;
}) {
  return (
    <Card className="border-secondary bg-card hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            {icon}
          </div>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className={`text-sm mt-1 ${subtitleColor}`}>{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}<span className="text-muted-foreground">/{max}</span></span>
      </div>
      <div className="w-full h-2 rounded-full bg-secondary">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function IdentityItem({ icon, type, value, connected }: { icon: React.ReactNode; type: string; value: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-secondary/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
          {icon}
        </div>
        <div>
          <div className="font-medium text-sm">{type}</div>
          <div className={`text-sm ${connected ? 'text-white' : 'text-muted-foreground'}`}>{value}</div>
        </div>
      </div>
      {connected ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected</Badge>
      ) : (
        <Button size="sm" variant="outline" className="text-xs">Connect</Button>
      )}
    </div>
  );
}

function ActivityItem({ action, detail, time, icon }: { action: string; detail: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{action}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  );
}
