// No imports needed from lucide-react
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export default function Header() {
  const { setTheme, theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-background shadow-sm dark:bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <i className="fa-solid fa-apple-whole text-2xl mr-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"></i>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NutriPlan
              </h1>
              <span className="text-xs text-muted-foreground">Your Wellness Journey</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative overflow-hidden"
          >
            <span className={`absolute inset-0 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'} flex items-center justify-center`}>
              <i className="fa-solid fa-sun text-amber-500 text-lg"></i>
            </span>
            <span className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>
              <i className="fa-solid fa-moon text-primary text-lg"></i>
            </span>
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notifications" className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <i className="fa-solid fa-bell text-lg"></i>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center space-x-2 focus:outline-none hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage
                      src={user?.profileImageUrl || ""}
                      alt={`${user?.firstName || ""} ${
                        user?.lastName || ""
                      }`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {user?.firstName || user?.email?.split("@")[0] || "User"}
                  </span>
                  <i className="fa-solid fa-chevron-down text-xs text-muted-foreground"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent">
                  <Link href="/profile" className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </span>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10">
                  <a href="/api/logout" className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-destructive"></span>
                    </span>
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              asChild
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all"
            >
              <a href="/api/login">Login</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
