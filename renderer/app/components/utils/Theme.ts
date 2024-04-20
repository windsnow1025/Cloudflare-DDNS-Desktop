import {createTheme} from "@mui/material/styles";

const convertTheme = (systemTheme: string) => {
  if (systemTheme === "system") {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    return prefersDarkScheme.matches ? "dark" : "light";
  } else if (systemTheme === "light" || systemTheme === "dark") {
    return systemTheme;
  } else {
    return "light";
  }
}

export function applyTheme(systemTheme: string) {
  const theme = convertTheme(systemTheme);
  applyMainTheme(theme);
}

function applyMainTheme(theme: string) {
  const body = document.body;

  // Remove all theme classes
  body.classList.remove("light-theme");
  body.classList.remove("dark-theme");

  if (theme === "light") {
    body.classList.add("light-theme");
  } else if (theme === "dark") {
    body.classList.add("dark-theme");
  }
}

export function createMUITheme(systemTheme: string) {
  const theme = convertTheme(systemTheme);
  return createTheme({
    palette: {
      mode: theme as "light" || "dark",
    }
  });
}
