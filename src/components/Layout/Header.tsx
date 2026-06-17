import React, { useState, useEffect } from "react";
import { Shield, Menu, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [isLight]);

  const toggleTheme = () => {
    const newMode = !isLight;
    setIsLight(newMode);
    localStorage.setItem("theme", newMode ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mozi-border bg-mozi-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-mozi-accent group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-tighter mozi-gradient-text">
            WEB SEC LAB
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium hover:text-mozi-accent transition-colors"
          >
            首页
          </Link>
          <Link
            to="/xss"
            className="text-sm font-medium hover:text-mozi-accent transition-colors"
          >
            XSS 实验室
          </Link>
          <Link
            to="/csrf"
            className="text-sm font-medium hover:text-mozi-accent transition-colors"
          >
            CSRF 实验室
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            title={isLight ? "切换到暗色模式" : "切换到亮色模式"}
          >
            {isLight ? (
              <Moon className="w-5 h-5 text-mozi-text" />
            ) : (
              <Sun className="w-5 h-5 text-mozi-text" />
            )}
          </button>

          <button className="px-4 py-2 rounded-full bg-mozi-accent/10 border border-mozi-accent/30 text-mozi-accent text-sm hover:bg-mozi-accent hover:text-mozi-black transition-all">
            开始学习
          </button>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <button onClick={toggleTheme} className="p-2">
            {isLight ? (
              <Moon className="w-6 h-6" />
            ) : (
              <Sun className="w-6 h-6" />
            )}
          </button>
          <button className="text-mozi-text">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
