import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";
import { store } from "./app/store";
import "./index.css";
import { VideoUploader } from "./features/VideoUploader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <VideoUploader />
    </Provider>
  </StrictMode>,
);
