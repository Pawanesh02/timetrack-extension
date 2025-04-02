import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Material Icons from Google CDN
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(<App />);
