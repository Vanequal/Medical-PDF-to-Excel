import React, { useState } from "react";
import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user] = useAuthState(auth); // Проверяем, залогинен ли пользователь
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const now = new Date().getTime();
      localStorage.setItem("lastLoginTime", now); // Сохраняем дату входа
      navigate("/dashboard");
    } catch (err) {
      setError("Неверные данные для входа");
    }
  };

  const handleLogout = async () => {
    await signOut(auth); // Выход из аккаунта
    localStorage.removeItem("lastLoginTime"); // Чистим данные
    navigate("/login");
  };

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">Вы уже вошли</h2>
          <p>Вы сейчас залогинены под аккаунтом: {user.email}</p>
          <button onClick={handleLogout} className="auth-btn">
            Выйти из аккаунта
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Вход</h2>
        {error && <p className="auth-error">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите email"
            required
          />
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
          />
          <button type="submit" className="auth-btn">
            Войти
          </button>
        </form>
        <p className="auth-footer">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
