"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, Search, Upload, User } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-8">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-green-400" />
            <span className="font-bold text-xl">Point Blank</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link 
            href="/directory" 
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/directory" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Directory
          </Link>
          {user && (
            <Link 
              href="/upload" 
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/upload" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Upload Resume
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/directory">
            <Button variant="outline" size="sm" className="gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search Talent</span>
            </Button>
          </Link>
          
          {user ? (
            <>
              <Link href="/upload">
                <Button className="gap-1 bg-green-500 hover:bg-green-600">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Resume</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/auth/sign-in")}>
                Sign In
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => router.push("/auth/sign-up")}
              >
                Sign Up
              </Button>
            </>
          )}
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}