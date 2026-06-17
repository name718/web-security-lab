import React from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-height-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-8 border-t border-mozi-grey text-center text-mozi-text/40 text-sm">
        <p>© 2026 Web Security Lab. 基于墨子风格的教育平台</p>
      </footer>
    </div>
  );
};

export default AppLayout;
