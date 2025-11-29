import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, Zap, Wallet, Globe, ExternalLink, 
  CheckCircle, Clock, Shield, ArrowRight
} from "lucide-react";

export default function DashboardApps() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connected Apps</h1>
            <p className="text-muted-foreground mt-1">Manage applications using your V-ID</p>
          </div>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Browse App Directory
          </Button>
        </div>

        {/* Velon Ecosystem */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Velon Ecosystem
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <EcosystemAppCard 
              name="Velgoo"
              description="Web3 financial super-app"
              icon={<Wallet className="w-6 h-6" />}
              status="connected"
              permissions={['identity', 'vscore']}
            />
            <EcosystemAppCard 
              name="RTPX"
              description="Behavior-to-value protocol"
              icon={<Zap className="w-6 h-6" />}
              status="connected"
              permissions={['identity', 'activity']}
            />
            <EcosystemAppCard 
              name="FlowID"
              description="Decentralized identity layer"
              icon={<Globe className="w-6 h-6" />}
              status="coming_soon"
              permissions={[]}
            />
          </div>
        </div>

        {/* Third-Party Apps */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Third-Party Applications
          </h2>
          
          <Card className="border-secondary">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                  <Layers className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No Third-Party Apps</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You haven't connected any external applications yet
                  </p>
                </div>
                <Button variant="outline">
                  Explore Apps
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Overview */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Data Permissions
            </CardTitle>
            <CardDescription>What data you're sharing with connected apps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <PermissionCard 
                permission="Identity"
                description="Your V-ID and verified status"
                apps={['Velgoo', 'RTPX']}
              />
              <PermissionCard 
                permission="V-Score"
                description="Your reputation score"
                apps={['Velgoo']}
              />
              <PermissionCard 
                permission="Activity"
                description="Your platform activity data"
                apps={['RTPX']}
              />
              <PermissionCard 
                permission="Wallet"
                description="Connected wallet addresses"
                apps={[]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function EcosystemAppCard({ name, description, icon, status, permissions }: {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'coming_soon';
  permissions: string[];
}) {
  const statusConfig = {
    connected: { label: 'Connected', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    available: { label: 'Available', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    coming_soon: { label: 'Coming Soon', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
  };

  return (
    <Card className="border-secondary hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <Badge className={statusConfig[status].color}>{statusConfig[status].label}</Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {permissions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {permissions.map((perm) => (
              <span key={perm} className="px-2 py-0.5 text-xs bg-secondary rounded text-muted-foreground">
                {perm}
              </span>
            ))}
          </div>
        )}

        {status === 'connected' && (
          <Button variant="ghost" size="sm" className="w-full mt-4 text-muted-foreground">
            Manage Access
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PermissionCard({ permission, description, apps }: {
  permission: string;
  description: string;
  apps: string[];
}) {
  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-secondary/50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{permission}</span>
        {apps.length > 0 ? (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            {apps.length} app{apps.length > 1 ? 's' : ''}
          </Badge>
        ) : (
          <Badge className="bg-secondary text-muted-foreground text-xs">No apps</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {apps.length > 0 && (
        <div className="flex gap-1 mt-3">
          {apps.map((app) => (
            <span key={app} className="px-2 py-0.5 text-xs bg-secondary rounded">{app}</span>
          ))}
        </div>
      )}
    </div>
  );
}
