
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}: StatCardProps) => {
  return (
    <Card className={cn("glass-card", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="rounded-md p-2 bg-muted/50">
            {icon}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>{description}</p>
        {trend && (
          <div className={cn(
            "flex items-center",
            trend.isPositive ? "text-green-500" : "text-safinet-red"
          )}>
            {trend.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {trend.value}%
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default StatCard;
