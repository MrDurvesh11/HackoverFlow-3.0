"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Briefcase,
  ChevronDown,
  CreditCard,
  Home,
  LineChart,
  MessageSquare,
  Settings,
  User,
  Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <ShadcnSidebar className="border-r border-border/40">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse-slow"></div>
              <div className="absolute inset-0.5 bg-background rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="font-bold text-lg tracking-tight">
              TradeSense<span className="text-blue-500">_Ai</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/"}>
                    <Link href="/">
                      <Home className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/market-analysis"}>
                    <Link href="/market-analysis">
                      <BarChart3 className="w-4 h-4" />
                      <span>Market Analysis</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/algo-trading"}>
                    <Link href="/algo-trading">
                      <LineChart className="w-4 h-4" />
                      <span>Algo Trading</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/portfolio"}>
                    <Link href="/portfolio">
                      <Briefcase className="w-4 h-4" />
                      <span>Portfolio</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/transactions"}>
                    <Link href="/transactions">
                      <CreditCard className="w-4 h-4" />
                      <span>Transactions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/chatbot"}>
                    <Link href="/chatbot">
                      <MessageSquare className="w-4 h-4" />
                      <span>FinChatbot</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                    <Link href="/settings">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border/40">
        <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">Pro Trader</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </SidebarFooter>
      </ShadcnSidebar>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <SidebarTrigger />
      </div>
    </SidebarProvider>
  )
}

