import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { ClientList } from "@/pages/ClientList";
import { ClientDetail } from "@/pages/ClientDetail";
import { Versions } from "@/pages/Versions";

export default function App() {
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/versions" element={<Versions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
