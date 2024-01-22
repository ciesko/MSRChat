import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Chat from "./pages/chat/Chat";
import { AppStateProvider } from "./state/AppProvider";
import { FluentProvider } from "@fluentui/react-components";
import ThemeService from "./services/themeService";

export default function App() {
    // Create instance of themeservice 
    const themeService = new ThemeService();
    const currentTheme = themeService.getTheme();
    return (
        <AppStateProvider>
            <FluentProvider
                theme={currentTheme}
                style={{ minHeight: "100vh" }}
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
