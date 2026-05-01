import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
);
