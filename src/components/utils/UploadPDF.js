import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import IndicatorMappingsManager from "./IndicatorMappingManager";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const UploadPDF = () => {
  // State definitions
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [showMappings, setShowMappings] = useState(false);
  const [indicatorMappings, setIndicatorMappings] = useState(() => {
    const saved = localStorage.getItem('indicatorMappings');
    return saved ? JSON.parse(saved) : {};
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('indicatorMappings', JSON.stringify(indicatorMappings));
  }, [indicatorMappings]);

  // Helper functions
  const updateProgress = (current, total) => {
    const percentage = Math.round((current / total) * 100);
    setProgress(percentage);
    setProcessedFiles(current);
  };

  const extractDate = (text) => {
    const dateRegex = /Дата[:]+(\d{2}[.-]\d{2}[.-]\d{4})/i;
    const match = text.match(dateRegex);
    return match ? match[1] : null;
  };

  const findTableStructure = (text) => {
    const lines = text.split('\n');
    const potentialHeaders = lines.filter(line =>
      /показатель|параметр|исследование/i.test(line)
    );

    if (!potentialHeaders.length) return null;

    const headerIndex = lines.findIndex(line =>
      potentialHeaders.some(header => line.includes(header))
    );

    if (headerIndex === -1) return null;

    const tableLines = lines.slice(headerIndex);
    const dataPattern = /(\d+[.,]?\d*)\s*(([а-яёa-z\d/*^]+)|(\d+\^\d+\/\w+)|%)?/i;
    const indicators = [];
    let currentLine = '';

    for (const line of tableLines) {
      if (!line.trim() || /^\d+([.,]\d+)?\s*$/.test(line)) continue;

      if (dataPattern.test(line)) {
        if (currentLine) {
          indicators.push(currentLine.trim());
          currentLine = '';
        }
        const [name] = line.split(dataPattern);
        if (name?.trim()) {
          indicators.push(name.trim());
        }
      } else {
        currentLine += ` ${line}`;
      }
    }

    return indicators.filter(ind =>
      ind.length > 1 &&
      !/^\d+$/.test(ind) &&
      !/^[.,]/.test(ind)
    );
  };

  const filterNoise = (text) => {
    const noisePatterns = [
      /Дата взятия образца:/,
      /Дата поступления образца:/,
      /Дата печати результата:/,
      /Дата выдачи:/,
      /Пол:/,
      /Возраст:/,
      /ИНЗ:/,
      /Врач:/,
      /ООО/,
      /www\./,
      /стр\./,
      /Наименование:/,
      /Результат:/,
      /Единицы:/,
      /Комментарии к заявке:/,
      /Название принимаемых пациентом препаратов:/,
      /Хранение и транспортировка/,
      /Результаты исследований не являются диагнозом/,
      /Внимание!/,
      /фибриногена до/,
      /Врач/,
      /^[А-Яа-я]+(\s+[А-Яа-я]+){1,2}$/
    ];

    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => !noisePatterns.some(pattern => pattern.test(line)))
      .join("\n");
  };

  const mergeBrokenLines = (text) => {
    const lines = text.split("\n");
    const mergedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i]?.trim() || '';
      const next = lines[i + 1]?.trim() || '';

      if (current && next && !/\d/.test(current) && !/:/.test(current) && /\d/.test(next)) {
        mergedLines.push(`${current} ${next}`);
        i += 1;
      } else {
        mergedLines.push(current);
      }
    }

    return mergedLines.join("\n");
  };

  const parsePdfData = (text) => {
    const date = extractDate(text);
    const tableStructure = findTableStructure(text);
    const cleanText = filterNoise(text);
    const mergedText = mergeBrokenLines(cleanText);
    const lines = mergedText.split("\n").filter(line => /\d/.test(line));

    const regex = /^(.*?[а-яА-Яa-zA-Z].*?)\s+([\d.,+\-*×/]+)\s*(г\/л|сек|%|ммоль\/л|мг\/л|ед\/л|ед\/мл|мкмоль\/л|кПа|мл\/мин|мг\/дл|мкг\/мл|фл|кл|пг|10\*[\d]+|[а-яА-Яa-zA-Z]*)?\s*([\d.,\-–\s]*)?$/;

    return lines
      .map(line => {
        const match = line.match(regex);
        if (!match) {
          console.log("Не удалось распознать строку:", line);
          return null;
        }

        const indicatorName = match[1]?.trim() || "Неизвестное исследование";
        let standardName = indicatorName;

        // Use mappings if available
        if (tableStructure && indicatorMappings) {
          const mappedName = Object.entries(indicatorMappings).find(
            ([, variants]) => variants.some(v =>
              indicatorName.toLowerCase().includes(v.toLowerCase())
            )
          );
          if (mappedName) {
            [standardName] = mappedName;
          }
        }

        return {
          Исследование: standardName,
          Результат: match[2]?.trim().replace(",", ".") || "Нет результата",
          Единицы: match[3]?.trim() || "",
          "Референсные значения": match[4]?.trim().replace(",", ".") || "",
          Дата: date
        };
      })
      .filter(Boolean);
  };

  const convertPdfToImages = async (pdfData) => {
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const images = [];

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL("image/png"));
    }

    return images;
  };

  const extractTextWithTesseract = async (image) => {
    const result = await Tesseract.recognize(image, "eng+rus", {
      logger: (m) => {
        console.log(m);
      },
    });
    return result.data.text;
  };

  const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data, {
      header: ["Исследование", "Результат", "Единицы", "Референсные значения", "Дата"]
    });

    ws["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Анализы");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const processPdfFiles = async (files) => {
    const parsedData = [];
    setLoading(true);

    for (const file of files) {
      try {
        const pdfData = await file.arrayBuffer();
        const pages = await convertPdfToImages(pdfData);

        const pageResults = await Promise.all(
          pages.map(async (pageImage) => {
            const text = await extractTextWithTesseract(pageImage);
            return parsePdfData(text);
          })
        );

        parsedData.push(...pageResults.flat());
        updateProgress(parsedData.length, files.length * pages.length);
      } catch (error) {
        console.error(`Ошибка обработки файла ${file.name}:`, error);
      }
    }

    exportToExcel(parsedData, "Medical_Analysis");
    setLoading(false);
  };

  // Indicator mapping functions
  const addIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: [...(prev[standardName] || []), variant]
    }));
  };

  const addNewIndicator = (name) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [name]: []
    }));
  };

  const deleteIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: prev[standardName].filter(v => v !== variant)
    }));
  };

  const deleteIndicator = (name) => {
    setIndicatorMappings(prev => {
      const { [name]: removed, ...rest } = prev;
      return rest;
    });
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Загрузка PDF файлов с анализами</h2>
        <button
          type="button"
          onClick={() => setShowMappings(!showMappings)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showMappings ? 'Скрыть настройки' : 'Настройки показателей'}
        </button>

        {showMappings && (
          <IndicatorMappingsManager
            mappings={indicatorMappings}
            onAddMapping={addNewIndicator}
            onAddVariant={addIndicatorVariant}
            onDeleteMapping={deleteIndicator}
            onDeleteVariant={deleteIndicatorVariant}
          />
        )}
      </div>

      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="file-input mb-4"
        disabled={loading}
      />

      {loading && (
        <div className="loading">
          <p>Обработано файлов: {processedFiles} из {fileCount}</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress}% завершено</p>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;