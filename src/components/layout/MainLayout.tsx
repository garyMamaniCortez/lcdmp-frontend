import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className={isMobile ? "min-h-screen" : "ml-64 min-h-screen"}>
        <div className={isMobile ? "p-4 pt-16" : "p-6 lg:p-8"}>
          {children}
        </div>
      </main>
    </div>
  );
}
