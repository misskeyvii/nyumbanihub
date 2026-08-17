import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router/config";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename="/">
        <AppRoutes />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
