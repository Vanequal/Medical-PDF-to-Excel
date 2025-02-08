import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedAuth from "./components/Auth/ProtectedAuth";
import Dashboard from "./components/Dashboard/Dashboard";
import Navbar from "./components/Common/Navbar";
import Footer from "./components/Common/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedAuth>
              <Dashboard />
            </ProtectedAuth>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
