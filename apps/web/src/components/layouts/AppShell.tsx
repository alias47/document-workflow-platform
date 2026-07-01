import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const headerProps = title !== undefined ? { title } : {};
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Header {...headerProps} />
      <main className="pl-[240px] pt-[60px]">{children}</main>
    </div>
  );
}
