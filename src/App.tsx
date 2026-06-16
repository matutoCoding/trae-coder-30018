import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import OrderList from "@/pages/orders/OrderList";
import OrderCreate from "@/pages/orders/OrderCreate";
import OrderDetail from "@/pages/orders/OrderDetail";
import Scheduling from "@/pages/scheduling/Scheduling";
import RitualTemplates from "@/pages/rituals/RitualTemplates";
import MaterialManage from "@/pages/materials/MaterialManage";
import BandSchedule from "@/pages/band/BandSchedule";
import Communication from "@/pages/communication/Communication";
import Settlement from "@/pages/settlement/Settlement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/new" element={<OrderCreate />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="rituals" element={<RitualTemplates />} />
          <Route path="materials" element={<MaterialManage />} />
          <Route path="band" element={<BandSchedule />} />
          <Route path="communication" element={<Communication />} />
          <Route path="settlement" element={<Settlement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
