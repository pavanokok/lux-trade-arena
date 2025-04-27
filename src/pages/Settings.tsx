
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [formState, setFormState] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    notifications: {
      email: true,
      push: true,
      priceAlerts: true,
      news: false,
      marketUpdates: true
    },
    tradingPreferences: {
      confirmTrades: true,
      defaultCurrency: "USD",
      darkMode: true
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences updated");
  };

  const handleSaveTrading = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Trading preferences updated");
  };

  return (
    <div className="container px-4 mx-auto py-6 lg:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="account">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formState.firstName}
                      onChange={e => setFormState({...formState, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formState.lastName}
                      onChange={e => setFormState({...formState, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formState.email}
                    onChange={e => setFormState({...formState, email: e.target.value})}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={formState.notifications.email} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        notifications: {...formState.notifications, email: checked}
                      })} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications in browser</p>
                    </div>
                    <Switch 
                      checked={formState.notifications.push} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        notifications: {...formState.notifications, push: checked}
                      })} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Price Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified about price movements</p>
                    </div>
                    <Switch 
                      checked={formState.notifications.priceAlerts} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        notifications: {...formState.notifications, priceAlerts: checked}
                      })} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">News Updates</h4>
                      <p className="text-sm text-muted-foreground">Receive important news and announcements</p>
                    </div>
                    <Switch 
                      checked={formState.notifications.news} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        notifications: {...formState.notifications, news: checked}
                      })} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Market Updates</h4>
                      <p className="text-sm text-muted-foreground">Get daily market summary reports</p>
                    </div>
                    <Switch 
                      checked={formState.notifications.marketUpdates} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        notifications: {...formState.notifications, marketUpdates: checked}
                      })} 
                    />
                  </div>
                </div>
                <Button type="submit">Save Preferences</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trading">
          <Card className="border-border/40 bg-secondary/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Trading Settings</CardTitle>
              <CardDescription>
                Customize your trading experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveTrading} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Confirm Trades</h4>
                      <p className="text-sm text-muted-foreground">Show confirmation dialog before executing trades</p>
                    </div>
                    <Switch 
                      checked={formState.tradingPreferences.confirmTrades} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        tradingPreferences: {...formState.tradingPreferences, confirmTrades: checked}
                      })} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <select 
                      id="currency" 
                      className="w-full border border-input bg-transparent h-10 rounded-md px-3 py-2 text-sm"
                      value={formState.tradingPreferences.defaultCurrency}
                      onChange={e => setFormState({
                        ...formState, 
                        tradingPreferences: {...formState.tradingPreferences, defaultCurrency: e.target.value}
                      })}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-muted-foreground">Enable dark mode for trading interface</p>
                    </div>
                    <Switch 
                      checked={formState.tradingPreferences.darkMode} 
                      onCheckedChange={(checked) => setFormState({
                        ...formState, 
                        tradingPreferences: {...formState.tradingPreferences, darkMode: checked}
                      })} 
                    />
                  </div>
                </div>
                <Button type="submit">Save Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
