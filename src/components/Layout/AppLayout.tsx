import React from "react";
import Header from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-mozi-black text-mozi-text transition-colors duration-300">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4">{children}</main>
      <footer className="py-4 border-t border-mozi-border text-center text-mozi-text-muted text-xs">
        <p>© 2026 Web Security Lab. 基于墨子风格的教育平台</p>
      </footer>
    </div>
  );
};

export default AppLayout;
