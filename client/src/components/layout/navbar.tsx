import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Recipes", href: "/recipes" },
  { name: "Meal Planner", href: "/meal-planner" },
  { name: "Nutrition Tracker", href: "/nutrition-tracker" },
  { name: "Grocery Lists", href: "/grocery-lists" },
  { name: "Health Bot", href: "/health-bot" },
  { name: "Preferences", href: "/preferences" },
];

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-dark-bg dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = 
              (item.href === "/" && location === "/") || 
              (item.href !== "/" && location.startsWith(item.href));
              
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
