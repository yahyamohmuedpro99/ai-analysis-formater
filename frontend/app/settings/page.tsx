'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: 'en',
    autoSave: true,
    email: '',
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        setSettings(prev => ({
          ...prev,
          email: user.email || '',
        }));
      } else {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router]);

  const handleSave = () => {
    toast({
      title: "No Changes Applied",
      description: "Settings are not implemented yet. This is for future development.",
    });
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <Header />
      
      <main className="container py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-slate-100">Settings</h1>
          <p className="text-muted-foreground dark:text-slate-400">Manage your preferences and account settings</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Preferences</CardTitle>
                <CardDescription className="dark:text-slate-400">Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-slate-300">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">Enable dark theme</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-slate-300">Notifications</Label>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">Receive email notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="dark:text-slate-300">Auto-save</Label>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">Automatically save your work</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings({...settings, autoSave: checked})}
                  />
                </div>
                
                <div>
                  <Label className="dark:text-slate-300">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => setSettings({...settings, language: value})}
                  >
                    <SelectTrigger className="mt-2 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="en" className="dark:text-slate-300">English</SelectItem>
                      <SelectItem value="es" className="dark:text-slate-300">Spanish</SelectItem>
                      <SelectItem value="fr" className="dark:text-slate-300">French</SelectItem>
                      <SelectItem value="de" className="dark:text-slate-300">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Account</CardTitle>
                <CardDescription className="dark:text-slate-400">Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="dark:text-slate-300">Email</Label>
                  <Input 
                    value={settings.email} 
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="mt-2 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                    disabled
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={handleSignOut} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    Sign Out
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="dark:text-slate-100">Profile</CardTitle>
                <CardDescription className="dark:text-slate-400">Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center dark:from-purple-700 dark:to-blue-700">
                    <span className="text-2xl text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium dark:text-slate-100">{user?.displayName || 'User'}</p>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
