import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Home from "./pages/Home";
import Fundamentals from "./pages/Fundamentals";
import XSSLab from "./pages/XSSLab/XSSLab";
import CSRFLab from "./pages/CSRFLab/CSRFLab";

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fundamentals" element={<Fundamentals />} />
          <Route path="/xss" element={<XSSLab />} />
          <Route path="/csrf" element={<CSRFLab />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
