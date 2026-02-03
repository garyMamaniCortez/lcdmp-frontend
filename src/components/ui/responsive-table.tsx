import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface MobileCardRowProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      {children}
    </div>
  );
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "mb-3 last:mb-0",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}

export function MobileCardRow({ label, children, className }: MobileCardRowProps) {
  return (
    <div className={cn("flex justify-between items-start gap-2", className)}>
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export function MobileCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 pb-2 border-b", className)}>
      {children}
    </div>
  );
}

export { useIsMobile };
