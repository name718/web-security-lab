import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Shield, X, Moon, Sun } from "lucide-react";
import {
  moduleGroups,
  moduleStats,
  navigationModules,
  type ModuleTone,
} from "../../content/modules";
import { useThemeMode } from "../../hooks/useThemeMode";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const toneDot: Record<ModuleTone, string> = {
  accent: "bg-mozi-accent",
  safe: "bg-mozi-safe",
  danger: "bg-mozi-danger",
};

const statusLabel: Record<string, string> = {
  recommended: "推荐",
  available: "可实验",
  planned: "规划中",
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isLight, toggleTheme } = useThemeMode();

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[100] flex w-72 flex-col border-r border-mozi-border bg-mozi-dark/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 品牌 */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-mozi-border px-5">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-mozi-accent/30 bg-mozi-accent/10">
              <Shield className="h-5 w-5 text-mozi-accent" />
            </span>
            <span className="text-base font-black tracking-tight mozi-gradient-text">
              WEB SEC LAB
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mozi-text-muted transition-colors hover:bg-mozi-black hover:text-mozi-text"
              title={isLight ? "切换到暗色模式" : "切换到亮色模式"}
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mozi-text-muted transition-colors hover:bg-mozi-black hover:text-mozi-text lg:hidden"
              aria-label="关闭导航"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 导航分组 */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {moduleGroups.map((group) => (
            <div key={group.id}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-mozi-text-muted">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <NavLink
                      key={module.id}
                      to={module.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-mozi-accent/10 text-mozi-text"
                            : "text-mozi-text-muted hover:bg-mozi-black/60 hover:text-mozi-text"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-colors ${
                              isActive
                                ? "text-mozi-accent"
                                : "text-mozi-text-muted group-hover:text-mozi-text"
                            }`}
                          />
                          <span className="flex-1 font-semibold leading-tight">
                            {module.navLabel}
                          </span>
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneDot[module.tone]} ${
                              isActive ? "opacity-100" : "opacity-40"
                            }`}
                            title={statusLabel[module.status]}
                          />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 底部统计 */}
        <div className="shrink-0 space-y-3 border-t border-mozi-border p-3">
          <Link
            to={navigationModules[0]?.path ?? "/"}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-mozi-accent/30 bg-mozi-accent/10 px-4 py-2.5 text-sm font-semibold text-mozi-accent transition-all hover:bg-mozi-accent hover:text-mozi-black"
          >
            开始学习
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-mozi-border bg-mozi-black/50 px-3 py-2.5">
              <div className="text-lg font-black text-mozi-text">
                {moduleStats.total}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-mozi-text-muted">
                模块
              </div>
            </div>
            <div className="rounded-xl border border-mozi-border bg-mozi-black/50 px-3 py-2.5">
              <div className="text-lg font-black text-mozi-text">
                {moduleStats.labs}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-mozi-text-muted">
                实验
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
