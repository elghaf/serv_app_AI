import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SourceSelector } from '@/components/dashboard/source-selector';
import { DashboardHeader } from '@/components/dashboard/header';
import { MainContent } from '@/components/dashboard/main-content';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <SourceSelector />
          </div>
          <MainContent user={userId} />
        </main>
      </div>
    </div>
  );
}

