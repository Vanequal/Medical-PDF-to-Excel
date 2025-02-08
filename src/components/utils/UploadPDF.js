import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const UploadPDF = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  // Список показателей с их возможными вариантами названий
  const INDICATORS = [
    { name: 'Эритроциты', variants: ['эритроциты', 'rbc', 'red blood cells'] },
    { name: 'Гемоглобин', variants: ['гемоглобин', 'hb', 'hemoglobin'] },
    { name: 'Гематокрит', variants: ['гематокрит', 'hct', 'гематокрит %'] },
    { name: 'Средний объем эритроцитов', variants: ['средний объем эритроцитов', 'mcv', 'средний объём эритроцитов'] },
    { name: 'Средняя концентрация Hb', variants: ['средняя концентрация', 'mchc', 'средняя концентрация гемоглобина'] },
    { name: 'Среднее содержание Hb', variants: ['среднее содержание', 'mch', 'среднее содержание гемоглобина'] },
    { name: 'Тромбоциты', variants: ['тромбоциты', 'plt', 'platelets'] },
    { name: 'Средний объем тромбоцитов', variants: ['средний объем тромбоцитов', 'mpv'] },
    { name: 'Тромбокрит', variants: ['тромбокрит', 'pct'] },
    { name: 'Лейкоциты', variants: ['лейкоциты', 'wbc', 'white blood cells'] },
    { name: 'Нейтрофилы', variants: ['нейтрофилы', 'neutrophils'] },
    { name: 'Нейтрофилы %', variants: ['нейтрофилы %', 'neutrophils %'] },
    { name: 'Лимфоциты', variants: ['лимфоциты', 'lymphocytes'] },
    { name: 'Лимфоциты %', variants: ['лимфоциты %', 'lymphocytes %'] },
    { name: 'Моноциты', variants: ['моноциты', 'monocytes'] },
    { name: 'Моноциты %', variants: ['моноциты %', 'monocytes %'] },
    { name: 'Эозинофилы', variants: ['эозинофилы', 'eosinophils'] },
    { name: 'Эозинофилы %', variants: ['эозинофилы %', 'eosinophils %'] },
    { name: 'Базофилы', variants: ['базофилы', 'basophils'] },
    { name: 'Базофилы %', variants: ['базофилы %', 'basophils %'] },
    { name: 'СОЭ', variants: ['соэ', 'esr', 'скорость оседания'] }
  ];

  const updateProgress = (current, total) => {
    const percentage = Math.round((current / total) * 100);
    setProgress(percentage);
    setProcessedFiles(current);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setFileCount(files.length);
    setProcessedFiles(0);
    setProgress(0);

    try {
      await processPdfFiles(files);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setLoading(false);
    }
  };

  const processPdfFiles = async (files) => {
    const allResults = {};
    let processedCount = 0;

    for (const file of files) {
      try {
        const pdfData = await file.arrayBuffer();
        const pages = await convertPdfToImages(pdfData);

        let fileText = "";
        for (const pageImage of pages) {
          const text = await extractTextWithTesseract(pageImage);
          fileText += text + "\n";
        }

        const date = extractDate(fileText) || file.name.split(".")[0];
        const analysisData = parseLabResults(fileText);

        if (analysisData.length > 0) {
          allResults[date] = analysisData;
        }

        processedCount++;
        updateProgress(processedCount, files.length);

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        processedCount++;
        updateProgress(processedCount, files.length);
      }
    }

    if (Object.keys(allResults).length > 0) {
      generateExcel(allResults);
    }
  };

  const parseLabResults = (text) => {
    const results = [];
    const lines = text.split("\n").map((line) => line.trim());

    const findValueAndUnits = (line) => {
      const match = line.match(
        /(\d+[.,]?\d*)\s*(([а-яёa-z\d/*^]+)|(\d+\^\d+\/\w+)|%)?/i
      );
      if (match) {
        return {
          value: match[1].replace(",", "."),
          units: match[2] || "",
        };
      }
      return null;
    };

    const findReference = (line) => {
      const match = line.match(/(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)/);
      return match ? `${match[1]}-${match[2]}` : "";
    };

    for (const indicator of INDICATORS) {
      let found = false;

      for (let i = 0; i < lines.length && !found; i++) {
        const currentLine = lines[i].toLowerCase();

        if (
          indicator.variants.some((variant) =>
            currentLine.includes(variant.toLowerCase())
          )
        ) {
          const searchLines = [
            currentLine,
            lines[i + 1]?.toLowerCase() || "",
          ];

          for (const searchLine of searchLines) {
            const valueData = findValueAndUnits(searchLine);
            if (valueData) {
              results.push({
                Показатель: indicator.name,
                Значение: valueData.value,
                Единицы: valueData.units,
                "Референсные значения": findReference(searchLine),
              });
              found = true;
              break;
            }
          }
        }
      }
    }

    return results;
  };

  const generateExcel = (allResults) => {
    const dates = Object.keys(allResults).sort();

    const excelData = INDICATORS.map((indicator) => {
      const row = {
        Показатель: indicator.name,
      };

      dates.forEach((date) => {
        const result = allResults[date].find(
          (r) => r.Показатель === indicator.name
        );
        if (result) {
          row[`Значение (${date})`] = result.Значение;
          row["Единицы"] = result.Единицы;
          row["Референсные значения"] = result["Референсные значения"];
        } else {
          row[`Значение (${date})`] = "";
        }
      });

      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const wscols = [
      { wch: 40 },
      ...dates.map(() => ({ wch: 15 })),
      { wch: 15 },
      { wch: 25 },
    ];
    ws["!cols"] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Результаты");
    XLSX.writeFile(wb, "Результаты_анализов.xlsx");
  };

  const extractDate = (text) => {
    const dateRegex = /Дата[:]+(\d{2}[.-]\d{2}[.-]\d{4})/i;
    const match = text.match(dateRegex);
    return match ? match[1] : null;
  };

  const convertPdfToImages = async (pdfData) => {
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const images = [];

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL("image/png"));
    }

    return images;
  };

  const extractTextWithTesseract = async (image) => {
    const result = await Tesseract.recognize(image, "eng+rus", {
      logger: (info) => console.log(info),
    });
    return result.data.text;
  };

  return (
    <div className="upload-container">
      <h2>Загрузка PDF файлов с анализами</h2>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="file-input"
        disabled={loading}
      />
      {loading && (
        <div className="loading">
          <p>Обработано файлов: {processedFiles} из {fileCount}</p>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </div>
          <p>{progress}% завершено</p>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;