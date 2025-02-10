import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function ProtectedAuth({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="text-center mt-20">Загрузка...</div>;
  }

  // Проверяем дату последнего входа
  const lastLoginTime = localStorage.getItem("lastLoginTime");
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

  if (lastLoginTime && new Date().getTime() - lastLoginTime > oneWeekInMs) {
    auth.signOut(); // Разлогиниваем пользователя
    localStorage.removeItem("lastLoginTime"); // Чистим localStorage
    return <Navigate to="/login" />;
  }

  return user ? children : <Navigate to="/login" />;
}

export default ProtectedAuth;
