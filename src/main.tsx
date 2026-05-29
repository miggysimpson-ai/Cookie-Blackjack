import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                "glass-panel-strong border-amber-500/30 text-white font-medium",
            },
          }}
        />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
);
