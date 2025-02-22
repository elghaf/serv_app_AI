import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { DashboardHeader } from '@/components/dashboard/header';
import { MainContent } from '@/components/dashboard/main-content';
import { Sidebar } from '@/components/dashboard/sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user data with Prisma
  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email as string,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // Add any other fields you need
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />
      <main className="flex-1 mx-auto max-w-8xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-9">
            <MainContent user={user} />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
