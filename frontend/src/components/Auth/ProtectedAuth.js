import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function ProtectedAuth({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="text-center mt-20">Загрузка...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

export default ProtectedAuth;
