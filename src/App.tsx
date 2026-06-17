import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/xss"
            element={
              <div className="text-center py-20 text-mozi-text/60">
                XSS 实验室正在建设中...
              </div>
            }
          />
          <Route
            path="/csrf"
            element={
              <div className="text-center py-20 text-mozi-text/60">
                CSRF 实验室正在建设中...
              </div>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
