import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  userRole?: string;
}

export function AppShell({ children, title, userName, userRole }: AppShellProps) {
  const sidebarProps = {
    ...(userName !== undefined && { userName }),
    ...(userRole !== undefined && { userRole }),
  };
  const headerProps = {
    ...(title !== undefined && { title }),
    ...(userName !== undefined && { userName }),
    ...(userRole !== undefined && { userRole }),
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar {...sidebarProps} />
      <Header {...headerProps} />
      <main className="pl-[240px] pt-[60px]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
