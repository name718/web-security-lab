import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // 路由变化时滚动内容区回到顶部
  const mainRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-mozi-black text-mozi-text transition-colors duration-300">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {/* 移动端浮动菜单按钮 */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-mozi-border bg-mozi-dark/95 text-mozi-text shadow-2xl backdrop-blur-xl transition-all hover:scale-110 hover:bg-mozi-accent hover:text-mozi-black active:scale-95 lg:hidden"
            aria-label="打开导航菜单"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8">
            {children}
          </div>

          <footer className="border-t border-mozi-border py-5 text-center text-xs text-mozi-text-muted">
            <p>© 2026 Web Security Lab · 可视化 Web 安全教育平台</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
