import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Zap, Globe, Trash2, Settings } from "lucide-react";

export default function DashboardApps() {
  return (
    <DashboardLayout>
       <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <div className="text-muted-foreground divider-ascii text-xs mb-2">// CONNECTED APPLICATIONS //</div>
          <h1 className="text-4xl font-bold tracking-tight">Connected Apps</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage authorized applications</p>
        </div>

        <div className="grid gap-6">
          <AppItem 
            name="Velgoo Wallet" 
            description="Primary wallet interface and asset management"
            icon={<Wallet className="w-6 h-6" />}
            color="bg-blue-600"
            permissions={["Read Profile", "Access Wallet", "Sign Tx"]}
            lastAccess="2 mins ago"
          />
          
          <AppItem 
            name="RTPX Missions" 
            description="Real-time mission tracking and energy system"
            icon={<Zap className="w-6 h-6" />}
            color="bg-purple-600"
            permissions={["Read Profile", "Energy Balance", "Mission Status"]}
            lastAccess="5 hours ago"
          />
          
           <AppItem 
            name="FlowID" 
            description="Decentralized identity verification"
            icon={<Globe className="w-6 h-6" />}
            color="bg-pink-600"
            permissions={["Read Profile", "Verify Credentials"]}
            lastAccess="1 day ago"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function AppItem({ name, description, icon, color, permissions, lastAccess }: any) {
  return (
    <Card className="border-secondary bg-card hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white flex-shrink-0`}>
              {icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold flex items-center gap-2">
                {name}
                <Badge className="text-[10px] h-5 bg-accent/20 text-accent border-accent/20">Auth</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">{description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {permissions.map((perm: string) => (
                  <span key={perm} className="px-2 py-1 rounded-md bg-secondary border border-secondary/50 text-[10px] text-muted-foreground">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <div className="text-xs text-muted-foreground">Last: {lastAccess}</div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex-1 md:flex-none border-secondary hover:bg-secondary text-xs h-8">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="flex-1 md:flex-none border-red-500/20 hover:bg-red-500/10 text-red-500 text-xs h-8">
                <Trash2 className="w-3 h-3 mr-1" />
                Revoke
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
