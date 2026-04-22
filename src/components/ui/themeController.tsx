import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeController: React.FC = () => {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // Determine initial theme on mount
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  // Prevent rendering before hydration to avoid flash
  if (!theme) return <div className="p-2 w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="transition-all duration-200" />
      ) : (
        <Sun size={20} className="transition-all duration-200" />
      )}
    </button>
  );
};

export default ThemeController;
