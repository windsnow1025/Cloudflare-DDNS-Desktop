import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./global.css";
import App from "./App";

const theme = createTheme({
  colorSchemes: {light: true, dark: true},
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <App/>
    </ThemeProvider>
  </StrictMode>,
);
