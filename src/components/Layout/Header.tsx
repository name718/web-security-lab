import React, { useState } from "react";
import { ChevronDown, Menu, Moon, Shield, Sun } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { moduleGroups, navigationModules } from "../../content/modules";
import { useThemeMode } from "../../hooks/useThemeMode";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLight, toggleTheme } = useThemeMode();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-mozi-accent" : "hover:text-mozi-accent"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mozi-border bg-mozi-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          onClick={() => setIsMenuOpen(false)}
        >
          <Shield className="w-8 h-8 text-mozi-accent group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-tighter mozi-gradient-text">
            WEB SEC LAB
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            首页
          </NavLink>

          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium hover:text-mozi-accent transition-colors">
              课程目录
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-[520px] -translate-x-1/2 rounded-3xl border border-mozi-border bg-mozi-black/95 p-4 opacity-0 shadow-2xl backdrop-blur-xl transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid gap-3">
                {moduleGroups.map((group) => (
                  <div key={group.id}>
                    <div className="mb-2 px-2">
                      <div className="text-xs font-black text-mozi-text">
                        {group.title}
                      </div>
                      <div className="text-[10px] leading-5 text-mozi-text-muted">
                        {group.description}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      {group.modules.map((module) => {
                        const Icon = module.icon;

                        return (
                          <NavLink
                            key={module.id}
                            to={module.path}
                            className="flex items-start gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-mozi-border hover:bg-mozi-dark"
                          >
                            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-mozi-accent" />
                            <div>
                              <div className="text-sm font-bold text-mozi-text">
                                {module.navLabel}
                              </div>
                              <div className="line-clamp-2 text-xs leading-5 text-mozi-text-muted">
                                {module.description}
                              </div>
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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

          <Link
            to={navigationModules[0]?.path ?? "/"}
            className="px-4 py-2 rounded-full bg-mozi-accent/10 border border-mozi-accent/30 text-mozi-accent text-sm hover:bg-mozi-accent hover:text-mozi-black transition-all"
          >
            开始学习
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2"
            title={isLight ? "切换到暗色模式" : "切换到亮色模式"}
          >
            {isLight ? (
              <Moon className="w-6 h-6" />
            ) : (
              <Sun className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            className="text-mozi-text"
            aria-expanded={isMenuOpen}
            aria-label="打开导航菜单"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden border-t border-mozi-border bg-mozi-black/95 px-4 py-4 space-y-2">
          <NavLink
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-xl px-4 py-3 text-sm hover:bg-mozi-dark"
          >
            首页
          </NavLink>
          {moduleGroups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-mozi-border p-2">
              <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-mozi-text-muted">
                {group.title}
              </div>
              {group.modules.map((module) => (
                <NavLink
                  key={module.id}
                  to={module.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-mozi-dark"
                >
                  {module.navLabel}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
