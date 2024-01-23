import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import { AppStateProvider } from "./state/AppProvider";
import { FluentProvider, tokens } from "@fluentui/react-components";
import ThemeService from "./services/themeService";
import Chat from "./pages/chat/Chat";

export default function App() {
    // Create instance of themeservice 
    const themeService = new ThemeService();
    const currentTheme = themeService.getTheme();
    return (
        <AppStateProvider>
            <FluentProvider
                theme={currentTheme}
                style={{ minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground3 }}
            >
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Chat />} />
                            <Route path="*" element={<NoPage />} />
                        </Route>
                    </Routes>
                </HashRouter>
            </FluentProvider>
        </AppStateProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
