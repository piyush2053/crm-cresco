import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ToastProvider from "./components/ToastProvider.jsx";
import FormAssist from "./components/FormAssist.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider><FormAssist /><App /></ToastProvider>
  </StrictMode>
);
