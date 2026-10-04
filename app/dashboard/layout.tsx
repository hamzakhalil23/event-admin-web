import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ToastProvider } from "../../components/ui/Toast";
import Sidebar from "../../components/ui/Sidebar";

// Server component — reads auth cookie and user data server-side
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const userRaw = cookieStore.get("admin_user")?.value;
  console.log("DashboardLayout: token:", token, "userRaw:", userRaw);

  if (!token || !userRaw) redirect("/");

  let user: { name: string; email: string; role: string } | null = null;
  try {
    user = JSON.parse(userRaw);
  } catch {
    redirect("/");
  }

  if (!user) redirect("/");

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar user={user} />
      <main className="ml-56 min-h-screen flex-1 p-8">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
