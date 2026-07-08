import React from "react";
import { Download } from "lucide-react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { AppContent } from "./components/layout/AppContent";
import { Footer } from "./components/layout/Footer";
import { useAppState } from "./hooks/useAppState";

export default function App() {
  const appState = useAppState();

  return (
    <div className="min-h-screen bg-appbg text-zinc-200 flex flex-col font-sans" id="app-root">
      <Header
        offlineOnly={appState.offlineOnly}
        currentHardware={appState.currentHardware}
        activeProfile={appState.activeProfile}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={appState.activeTab}
          setActiveTab={appState.setActiveTab}
          downloadedModelsCount={appState.models.filter((m) => m.downloaded).length}
        />

        <AppContent {...appState} />
      </div>

      {appState.models.some((m) => m.isDownloading) && (
        <div className="bg-emerald-950/80 border-t border-emerald-900 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 font-mono" id="persistent-download-banner">
          <div className="flex items-center space-x-2 truncate">
            <Download className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span className="truncate">
              Download locale del modello in corso... Sincronizzazione segmenti sul disco in sandbox locale.
            </span>
          </div>
          <div className="shrink-0 flex items-center space-x-3 ml-4">
            <span className="font-bold">
              {appState.models.find((m) => m.isDownloading)?.downloadProgress}%
            </span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
