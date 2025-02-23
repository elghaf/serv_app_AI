import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from '@/components/dashboard/header';
import MainContent from '@/components/dashboard/main-content';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Total Detections</h3>
                <p className="text-2xl font-bold">1,234</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Active Cameras</h3>
                <p className="text-2xl font-bold">3</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Alert Status</h3>
                <p className="text-2xl font-bold text-green-500">Normal</p>
              </Card>
            </div>
            <MainContent user={userId} />
          </main>
        </div>
      </div>
    </div>
  );
}

