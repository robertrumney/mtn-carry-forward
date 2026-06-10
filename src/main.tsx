import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./app.css";

const convex = new ConvexReactClient("https://vibrant-labrador-864.convex.cloud");

// Use Vite's BASE_URL so React Router matches the deploy path ("/", "/preview/", etc.)
const basename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>
);
