import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';

export default function Layout() {
  return (
    <div className="min-h-screen w-full">
      <AppSidebar />
      <main className="relative z-10 min-h-screen w-full px-3 pb-8 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
        <div className="mx-auto w-full max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
