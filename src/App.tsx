import { Routes, Route } from "react-router";
import Landing from "@/pages/Landing";
import Admin from "./pages/admin";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route index element={<Landing />} />
        <Route path="admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
