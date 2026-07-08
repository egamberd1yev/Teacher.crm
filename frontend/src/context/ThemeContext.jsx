import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    // html classiga qo'shamiz (CSS uchun)
    document.documentElement.classList.toggle("dark", dark);

    // Body'ni to'g'ridan-to'g'ri JS bilan yangilaymiz (mobil uchun ishonchli)
    document.body.style.backgroundColor = dark ? "#0F1117" : "#F4F5F7";
    document.body.style.color = dark ? "#E8EAED" : "#111318";

    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}