import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
};