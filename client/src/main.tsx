import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupTracker } from "./lib/tracker";

// Initialize the tracker when the extension loads
setupTracker();

createRoot(document.getElementById("root")!).render(<App />);
