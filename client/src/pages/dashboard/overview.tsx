import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Smartphone, MapPin, Clock, Users } from "lucide-react";

export default function DashboardOverview() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <div className="text-muted-foreground divider-ascii text-xs mb-2">// YOUR IDENTITY //</div>
          <h1 className="text-4xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your V-ID is verified and secure</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-secondary bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                Verified
              </div>
              <p className="text-xs text-muted-foreground mt-2">Level 2 KYC</p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">98%</div>
              <p className="text-xs text-muted-foreground mt-2">Excellent</p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-2">Active</p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-2">Connected</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* V-ID Card */}
          <Card className="border-secondary bg-card col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Your V-ID</CardTitle>
              <CardDescription>Your unique identifier for the Velon ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-secondary border border-secondary/50 space-y-4">
                <div className="flex items-center gap-4">
                  <img src="https://github.com/shadcn.png" className="w-16 h-16 rounded-lg border border-secondary" alt="Profile" />
                  <div>
                    <h3 className="font-semibold text-lg">Alice Chen</h3>
                    <p className="font-mono text-sm text-primary mt-1">VID-8842-9912-XJ92</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-accent/20 text-accent border-accent/20">Verified</Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/20">Early Adopter</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-secondary bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest authentication events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem 
                  title="Logged into Velgoo" 
                  time="2 mins ago"
                  location="San Francisco, US"
                />
                <ActivityItem 
                  title="Logged into RTPX" 
                  time="5 hours ago"
                  location="San Francisco, US"
                />
                <ActivityItem 
                  title="Password Changed" 
                  time="2 days ago"
                  location="San Francisco, US"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActivityItem({ title, time, location }: any) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-secondary last:border-b-0 last:pb-0">
      <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
          <span>•</span>
          <MapPin className="w-3 h-3" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
