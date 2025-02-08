import React from "react";
import UploadPDF from "../utils/UploadPDF"; 
import "../../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Добро пожаловать в систему!</h1>
        <p>Загрузите свои медицинские анализы и получите таблицу Excel.</p>
      </header>

      <main className="dashboard-main">
        <section className="upload-section">
          <h2>Загрузка файлов</h2>
          <p>Выберите файлы в формате PDF для обработки:</p>
          <UploadPDF /> 
        </section>

        <section className="history-section">
          <h2>История загрузок</h2>
          <p>Здесь будут отображаться обработанные файлы.</p>
          <div className="history-placeholder">
            <p>История пока пуста.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
