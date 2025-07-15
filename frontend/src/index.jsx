import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import store from "./redux/store";
import "./index.scss";
import AppRoutes from "./routes";
import DisableNumInputScroll from "./components/DisableNumberScroll";

let persistor = persistStore(store);
const root = ReactDOM.createRoot(document.getElementById("root"));

const initializeApp = async () => {
  root.render(
    // <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <DisableNumInputScroll />
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
    // </React.StrictMode>
  );
};

initializeApp();
