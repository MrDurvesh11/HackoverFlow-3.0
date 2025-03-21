"use client"

import { useState } from "react"
import { Bell, Globe, Lock, Moon, PaintBucket, Save, Sun, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border/40 p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your trading experience</p>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="bg-background/50 border border-border/40 mb-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <PaintBucket className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself"
                    defaultValue="Professional trader with 5+ years of experience in stocks and cryptocurrencies."
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <div
                      className={`flex flex-col items-center gap-2 cursor-pointer ${theme === "light" ? "opacity-100" : "opacity-50"}`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="w-20 h-20 rounded-md bg-white border border-border/40 flex items-center justify-center">
                        <Sun className="h-8 w-8 text-amber-500" />
                      </div>
                      <span className="text-sm">Light</span>
                    </div>
                    <div
                      className={`flex flex-col items-center gap-2 cursor-pointer ${theme === "dark" ? "opacity-100" : "opacity-50"}`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="w-20 h-20 rounded-md bg-gray-900 border border-border/40 flex items-center justify-center">
                        <Moon className="h-8 w-8 text-blue-400" />
                      </div>
                      <span className="text-sm">Dark</span>
                    </div>
                    <div
                      className={`flex flex-col items-center gap-2 cursor-pointer ${theme === "system" ? "opacity-100" : "opacity-50"}`}
                      onClick={() => setTheme("system")}
                    >
                      <div className="w-20 h-20 rounded-md bg-gradient-to-br from-white to-gray-900 border border-border/40 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-purple-400" />
                      </div>
                      <span className="text-sm">System</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer border-2 border-primary"></div>
                      <span className="text-xs">Default</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-gradient-to-r from-green-500 to-blue-500 cursor-pointer"></div>
                      <span className="text-xs">Ocean</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-gradient-to-r from-red-500 to-amber-500 cursor-pointer"></div>
                      <span className="text-xs">Sunset</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer"></div>
                      <span className="text-xs">Neon</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Interface Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations" className="cursor-pointer">
                        Enable animations
                      </Label>
                      <Switch id="animations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact" className="cursor-pointer">
                        Compact mode
                      </Label>
                      <Switch id="compact" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="blur" className="cursor-pointer">
                        Blur effects
                      </Label>
                      <Switch id="blur" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Market Alerts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price-alerts" className="cursor-pointer">
                        Price alerts
                      </Label>
                      <Switch id="price-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="market-news" className="cursor-pointer">
                        Market news
                      </Label>
                      <Switch id="market-news" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="earnings" className="cursor-pointer">
                        Earnings announcements
                      </Label>
                      <Switch id="earnings" defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Trading Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trade-execution" className="cursor-pointer">
                        Trade execution
                      </Label>
                      <Switch id="trade-execution" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="algo-alerts" className="cursor-pointer">
                        Algo trading alerts
                      </Label>
                      <Switch id="algo-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="portfolio" className="cursor-pointer">
                        Portfolio updates
                      </Label>
                      <Switch id="portfolio" defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Channels</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="cursor-pointer">
                        Email notifications
                      </Label>
                      <Switch id="email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push" className="cursor-pointer">
                        Push notifications
                      </Label>
                      <Switch id="push" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms" className="cursor-pointer">
                        SMS notifications
                      </Label>
                      <Switch id="sms" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="block">Enable 2FA</Label>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="2fa" defaultChecked />
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm">
                        Configure 2FA
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Session Management</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-xs text-muted-foreground mt-1">Windows • Chrome • New York, USA</p>
                        </div>
                        <div className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">Active Now</div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Mobile App</p>
                          <p className="text-xs text-muted-foreground mt-1">iOS • TradeSense App • New York, USA</p>
                        </div>
                        <div className="text-xs text-muted-foreground">Last active: 2 hours ago</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Log Out All Other Sessions
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

