import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedAuth from "./components/Auth/ProtectedAuth";
import Dashboard from "./components/Dashboard/Dashboard";
import Navbar from "./components/Common/Navbar";
import Footer from "./components/Common/Footer";
import { auth } from "./firebase/firebase";

function App() {
  const isLoggedIn = !!auth.currentUser; 

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedAuth>
              <Dashboard />
            </ProtectedAuth>
          }
        />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
