import React, { useState } from "react";
import "../../styles/uploadPDF.css";

const UploadPDF = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define the base URL for your backend
  const BACKEND_URL = "https://medical-pdf-to-excel.onrender.com/upload/";

  const validateFileName = (filename) => {
    const datePatterns = [
      /\d{8}/,             // YYYYMMDD
      /\d{2}\.\d{2}\.\d{4}/, // DD.MM.YYYY
      /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /\d{2}-\d{2}-\d{4}/  // DD-MM-YYYY
    ];

    return datePatterns.some(pattern => pattern.test(filename));
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const invalidFiles = files.filter(file => !validateFileName(file.name));

    if (invalidFiles.length > 0) {
      setError(`Следующие файлы имеют неверный формат имени (требуется дата в формате YYYYMMDD или DD.MM.YYYY): ${invalidFiles.map(f => f.name).join(", ")}`);
      event.target.value = null;
      return;
    }

    setError(null);
    await handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        // Remove credentials if you're not using authentication
        // credentials: 'include', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Произошла ошибка при загрузке файлов');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Medical_Analysis.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      setError(`Ошибка: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Загрузка PDF файлов с анализами</h2>
        <p className="text-gray-600 mb-4">
          Имя файла должно содержать дату в формате YYYYMMDD или DD.MM.YYYY
        </p>
      </div>

      <div className="mb-4">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="file-input"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-4">
          <div className="animate-pulse">Обработка файлов...</div>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;