import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeStorage } from "./lib/localStorage";

// Initialize localStorage on app start
initializeStorage();

createRoot(document.getElementById("root")!).render(<App />);
