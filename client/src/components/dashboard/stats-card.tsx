import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  progress?: number;
  total?: string | number;
  additionalInfo?: string;
  className?: string;
  darkBgColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  progress,
  total,
  additionalInfo,
  className,
  darkBgColor,
}: StatsCardProps) {
  return (
    <div 
      className={cn(
        "bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md hover:translate-y-[-2px] hover:border-primary/20 transition-all duration-200 dark:shadow-none group",
        className
      )}
    >
      <div className="flex items-center">
        <div className={cn(
          "p-3 rounded-full mr-4 transition-all duration-200", 
          iconBgColor, 
          darkBgColor,
          "group-hover:scale-110"
        )}>
          <div className={cn("", iconColor, "transition-transform duration-200 hover:scale-110")}>{icon}</div>
        </div>
        <div className="flex-1">
          <p className="text-body-small font-heading font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-heading-4 font-semibold text-foreground mt-0.5 leading-none">
              {value}
              {total && <span className="text-body-small font-normal text-muted-foreground ml-1">/ {total}</span>}
            </p>
          </div>
          {progress !== undefined && (
            <div className="mt-3 mb-1">
              <Progress 
                value={progress} 
                className="h-1.5" 
                indicatorClassName={cn(
                  "bg-gradient-to-r", 
                  iconColor === "text-primary" ? "from-primary to-primary/80" :
                  iconColor === "text-secondary" ? "from-secondary to-secondary/80" :
                  iconColor === "text-amber-500" ? "from-amber-500 to-amber-400" :
                  "from-purple-500 to-purple-400"
                )}
              />
            </div>
          )}
          {additionalInfo && (
            <p className="text-body-small mt-1.5 text-muted-foreground">{additionalInfo}</p>
          )}
        </div>
      </div>
    </div>
  );
}
