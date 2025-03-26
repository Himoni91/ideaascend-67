
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Bell, Shield, User, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSettings = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AppLayout>
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-20"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <motion.div variants={itemVariants} className="mb-4">
          <Link 
            to="/profile"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and settings
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="account" onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="account" className="flex items-center justify-center">
                <User className="h-4 w-4 mr-2 md:mr-0 md:hidden lg:mr-2 lg:block" />
                <span className="hidden md:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center">
                <Bell className="h-4 w-4 mr-2 md:mr-0 md:hidden lg:mr-2 lg:block" />
                <span className="hidden md:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center justify-center">
                <Palette className="h-4 w-4 mr-2 md:mr-0 md:hidden lg:mr-2 lg:block" />
                <span className="hidden md:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2 md:mr-0 md:hidden lg:mr-2 lg:block" />
                <span className="hidden md:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Account</CardTitle>
                  <CardDescription>
                    Manage your account information and connected services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Address</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p>{user?.email}</p>
                        <p className="text-sm text-muted-foreground">Your primary email address</p>
                      </div>
                      <Button variant="outline">
                        Change Email
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p>••••••••••••</p>
                        <p className="text-sm text-muted-foreground">Last updated 3 months ago</p>
                      </div>
                      <Button variant="outline">
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Connected Accounts</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium">Google</p>
                            <p className="text-sm text-muted-foreground">Connected</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Disconnect
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium">LinkedIn</p>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                    <div className="rounded-lg border border-destructive/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-messages">Direct Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications when someone messages you
                          </p>
                        </div>
                        <Switch id="email-messages" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-mentions">Mentions</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications when someone mentions you
                          </p>
                        </div>
                        <Switch id="email-mentions" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-sessions">Mentor Sessions</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications about upcoming mentor sessions
                          </p>
                        </div>
                        <Switch id="email-sessions" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-newsletter">Newsletter</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive our weekly newsletter with startup resources
                          </p>
                        </div>
                        <Switch id="email-newsletter" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Push Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-all">Enable Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your device
                          </p>
                        </div>
                        <Switch id="push-all" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-messages">Direct Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you receive a direct message
                          </p>
                        </div>
                        <Switch id="push-messages" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-comments">Comments & Replies</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when someone comments on your content
                          </p>
                        </div>
                        <Switch id="push-comments" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Color Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose between light, dark, or system theme
                        </p>
                      </div>
                      <ModeToggle />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Display</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reduced-motion">Reduced Motion</Label>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations and transitions
                          </p>
                        </div>
                        <Switch id="reduced-motion" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="high-contrast">High Contrast</Label>
                          <p className="text-sm text-muted-foreground">
                            Enhance visual distinction between elements
                          </p>
                        </div>
                        <Switch id="high-contrast" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your privacy settings and security options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="privacy-profile">Profile Visibility</Label>
                          <p className="text-sm text-muted-foreground">
                            Control who can view your profile
                          </p>
                        </div>
                        <div className="w-[180px]">
                          <select 
                            id="privacy-profile"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="public">Public</option>
                            <option value="members">Members Only</option>
                            <option value="connections">Connections Only</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="privacy-activity">Activity Visibility</Label>
                          <p className="text-sm text-muted-foreground">
                            Control who can see your activity on the platform
                          </p>
                        </div>
                        <div className="w-[180px]">
                          <select 
                            id="privacy-activity"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="public">Public</option>
                            <option value="members">Members Only</option>
                            <option value="connections">Connections Only</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="privacy-messages">Message Requests</Label>
                          <p className="text-sm text-muted-foreground">
                            Control who can send you messages
                          </p>
                        </div>
                        <div className="w-[180px]">
                          <select 
                            id="privacy-messages"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="all">Everyone</option>
                            <option value="connections">Connections Only</option>
                            <option value="none">No One</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="security-2fa">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">
                          Configure
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="security-sessions">Active Sessions</Label>
                          <p className="text-sm text-muted-foreground">
                            Manage your active login sessions
                          </p>
                        </div>
                        <Button variant="outline">
                          View
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="security-data">Data Export</Label>
                          <p className="text-sm text-muted-foreground">
                            Download a copy of your personal data
                          </p>
                        </div>
                        <Button variant="outline">
                          Request
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default ProfileSettings;
