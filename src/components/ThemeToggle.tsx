import { useContext } from "react";
import { GlobalContext } from "./ThemeProvider";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(GlobalContext);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      onClick={toggleTheme}
      className="cursor-pointer"
      style={{
        width: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        transition: "all 0.3s ease",
        backgroundColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        color: theme === "dark" ? "#fff" : "#000",
        fontSize: 18,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
      }}
    >
      <span
        style={{
          display: "inline-block",
          transition: "transform 0.4s ease, opacity 0.3s ease",
          transform: theme === "dark" ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
      </span>
    </div>
  );
}
