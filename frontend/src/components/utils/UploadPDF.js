import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import IndicatorMappingsManager from "./IndicatorMappingManager";
import '../../styles/uploadPDF.css'



pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const UploadPDF = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [showMappings, setShowMappings] = useState(false);

  const [validIndicators, setValidIndicators] = useState(() => {
    const saved = localStorage.getItem('validIndicators');
    return saved ? JSON.parse(saved) : [
      'СОЭ', 'эритроциты', 'гемоглобин', 'гемотакрит',
      'средний объем эритроцитов (МСV)',
      'среднее содержание гемоглобина в эритроцитах (МСH)',
      'средняя концентрация гемоглобина в эритроцитах (MCHC)',
      'распределение эритроцитов по объему (RDW-SD)',
      'распределение эритроцитов по объему (вариабельность)',
      'тромбоциты', 'тромбоциты %',
      'средний объем тромбоцитов (MPV)',
      'коэффициент больших тромбоцитов',
      'лейкоциты', 'нейтрофилы', 'лимфоциты', 'моноциты',
      'эозинофилы', 'базофилы', 'нейтрофилы %',
      'лимфоциты %', 'моноциты %', 'эозинофилы %',
      'базофилы %',

      // Гормоны
      'тироксин Т4 св', 'ТТГ', 'Т3 св', 'анти ТПО',
      'паратгормон',

      // Биохимические показатели
      'общий белок', 'альбумин', '% соотношение',
      'белковые фракции', 'альбумин %',
      'Альфа-1-глобулин', 'Альфа-1-глобулин %',
      'Альфа-2-глобулин', 'Альфа-2-глобулин %',
      'Бета-1-глобулин', 'Бета-1-глобулин %',
      'Бета-2-глобулин', 'Бета-2-глобулин %',
      'гамма-глобулин', 'гамма-глобулин %',
      'билирубин непрямой', 'билирубин прямой', 'билирубин общий',
      'АЛТ', 'АСТ', 'Коэфф. де Ритиса (АСТ/АЛТ)',
      'ГГТ', 'глюкоза', 'гликированный гемоглобин',
      'инсулин', 'щелочная фосфатаза', 'железо сывороточное',
      'ферритин', 'трансферрин',
      'ЛПВП', 'ЛПНП', 'ЛПОНП', 'триглицериды',
      'не ЛПВП', 'общий холестерин', 'липопротеин А',
      'коэффициент атерогенности',
      'СРБ', 'витамин В12 (цианокобаламин)',
      'гомоцистеин', 'витамин D (25-ОН)',
      'мочевая кислота', 'креатинин', 'мочевина',
      'кальций общий', 'магний', 'цинк', 'фосфор',
      'натрий', 'калий', 'лактат', 'ЛДГ', 'Фибриноген', 'АЧТВ', 'МНО', 'Протромбин', 'Протромбинованое время', 'Протромбин (по квику)',

      // Аминокислоты
      '1-метилгистидин', '3-метилгистидин',
      'α-аминоадипиновая кислота', 'α-аминомасляная кислота',
      'β-аланин', 'β-аминоизомасляная кислота',
      'γ-аминомасляная кислота', 'аланин', 'алло-изолейцин',
      'ансерин', 'аргинин', 'аргинин-янтарная кислота',
      'аспарагин', 'аспарагиновая кислота', 'валин',
      'гидроксилизин', 'гидроксипролин', 'гистидин',
      'глицин', 'глутамин', 'глутаминовая кислота',
      'гомоцистеин', 'гомоцитрулин', 'изолейцин',
      'карнозин', 'лейцин', 'лизин', 'метионин',
      'орнитин', 'пипеколиновая кислота', 'пролин',
      'саркозин', 'серин', 'таурин', 'тирозин',
      'треонин', 'триптофан', 'фенилаланин',
      'фосфосерин', 'фосфоэтаноламин', 'цистотионин',
      'цистин', 'цитруллин', 'этаноламин',

      // Органические кислоты
      'молочная кислота', 'пировиноградная кислота',
      'лимонная кислота', 'цис-аконитовая кислота',
      'изолимонная кислота', '2-кетоглутаровая кислота',
      'янтарная кислота', 'фумаровая кислота',
      'яблочная кислота', '2-метилгипуровая кислота',
      'ацетоуксусная кислота', '3-гидроксимасляная кислота',
      'малоновая кислота',

      // Прочие метаболиты
      'гликолиевая кислота', 'глицериновая кислота',
      'щавелевая кислота', 'метаболиты витаминов В1, В2, В5, В7',
      'глутаровая кислота', 'адипиновая кислота',
      'себациновая кислота', 'ксантуреновая кислота',
      'кинуреновая кислота', 'метилмалоновая кислота',
      'пироглутаминовая кислота'
    ];
  });

  const [indicatorMappings, setIndicatorMappings] = useState(() => {
    const saved = localStorage.getItem('indicatorMappings');
    return saved ? JSON.parse(saved) : {};
  });


  useEffect(() => {
    localStorage.setItem('indicatorMappings', JSON.stringify(indicatorMappings));
    localStorage.setItem('validIndicators', JSON.stringify(validIndicators));
  }, [indicatorMappings, validIndicators]);


  const updateProgress = (current, total) => {
    const percentage = Math.round((current / total) * 100);
    setProgress(percentage);
    setProcessedFiles(current);
  };

  const extractDateFromFilename = (filename) => {
    const patterns = [
      /(\d{4})(\d{2})(\d{2})/,
      /(\d{2})(\d{2})(\d{4})/,
      /(\d{4})[.-](\d{2})[.-](\d{2})/,
      /(\d{2})[.-](\d{2})[.-](\d{4})/,
      /(\d{4})\s+(\d{2})\s+(\d{2})/,
      /(\d{2})\s+(\d{2})\s+(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        const [_, part1, part2, part3] = match;
        if (part1.length === 4) {
          return `${part1}-${part2}-${part3}`;
        }
        return `${part3}-${part2}-${part1}`;
      }
    }
    return null;
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
      /Врач/,
      /^[А-Яа-я]+(\s+[А-Яа-я]+){1,2}$/
    ];

    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => {
        if (line.length === 0) return false;
        
        // Preserve lines with numeric values and units
        if (
          /\d/.test(line) && 
          (/10\*\d+\/л/.test(line) ||
           /кл\/л/.test(line) ||
           /г\/л/.test(line) ||
           /10\*\d+/.test(line) ||
           /мм\/час/.test(line) ||
           /%/.test(line) ||
           /пг/.test(line))
        ) {
          return true;
        }
        
        // Filter out noise patterns
        return !noisePatterns.some(pattern => pattern.test(line));
      })
      .join("\n");
  };

  const mergeBrokenLines = (text) => {
    const lines = text.split("\n");
    const mergedLines = [];
    let currentLine = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      const nextLine = lines[i + 1]?.trim() || '';

      // Check if current line is start of an indicator
      if (findIndicator(line)) {
        if (currentLine) mergedLines.push(currentLine);
        currentLine = line;
      }
      // Check if next line contains units or values
      else if (
        /^[\d.,]+$/.test(nextLine) ||
        /^[0-9.,\-–\s]+$/.test(nextLine) ||
        /^(?:10\*\d+\/л|г\/л|%|пг|мм\/час)/.test(nextLine)
      ) {
        if (currentLine) currentLine += " " + line;
        else currentLine = line;
      }
      // If line contains both name and value
      else if (/\d/.test(line) && findIndicator(line)) {
        if (currentLine) mergedLines.push(currentLine);
        currentLine = line;
      }
      else {
        if (currentLine) currentLine += " " + line;
        else currentLine = line;
      }
    }

    if (currentLine) mergedLines.push(currentLine);
    return mergedLines.join("\n");
  };

  const findIndicator = (name) => {
    return validIndicators.find(indicator =>
      name.toLowerCase().includes(indicator.toLowerCase())
    );
  };


  const parsePdfData = (text, date) => {
    const cleanText = filterNoise(text);
    const mergedText = mergeBrokenLines(cleanText);
    const lines = mergedText.split("\n").filter(line => line.trim().length > 0);

    const valuePattern = /[\d.,]+/;
    const unitsPattern = /(?:10\*\d+\/л|г\/л|%|пг|мм\/час|кл\/л|фл|пг\/кл)/;
    const referencePattern = /[\d.,]+\s*[-–]\s*[\d.,]+/;

    return lines
      .map(line => {
        // Find valid indicator first
        const indicatorName = findIndicator(line);
        if (!indicatorName) return null;

        // Extract values after finding valid indicator
        const parts = line.split(/\s+/);
        let value = null;
        let units = null;
        let reference = null;

        // Look for patterns in remaining parts
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          
          if (!value && valuePattern.test(part)) {
            value = part.replace(",", ".");
          }
          else if (!units && unitsPattern.test(part)) {
            units = part;
          }
          else if (!reference && referencePattern.test(part)) {
            reference = part;
          }
        }

        if (!value) return null;

        return {
          Исследование: indicatorName,
          [`Результат (${date})`]: value,
          [`Единицы (${date})`]: units || "",
          [`Референс (${date})`]: reference || ""
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

  const exportToExcel = (data, fileName, columnWidths) => {
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = Array.from(columnWidths.values()).map(width => ({ wch: width }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Анализы");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const processPdfFiles = async (files) => {
    const allData = new Map();
    setLoading(true);

    try {
      for (const file of files) {
        const fileDate = extractDateFromFilename(file.name);
        if (!fileDate) continue;

        const pdfData = await file.arrayBuffer();
        const pages = await convertPdfToImages(pdfData);

        for (const pageImage of pages) {
          const text = await extractTextWithTesseract(pageImage);
          const pageResults = parsePdfData(text, fileDate);

          // Merge results maintaining data integrity
          pageResults.forEach(result => {
            const indicator = result.Исследование;
            if (!allData.has(indicator)) {
              allData.set(indicator, { Исследование: indicator });
            }
            
            const existingData = allData.get(indicator);
            // Only update if we have new data for this date
            const dateColumns = Object.keys(result).filter(key => key !== 'Исследование');
            dateColumns.forEach(column => {
              if (result[column]) {
                existingData[column] = result[column];
              }
            });
          });

          updateProgress(allData.size, files.length * pages.length);
        }
      }

      const finalData = Array.from(allData.values());
      const columnWidths = calculateColumnWidths(finalData);
      exportToExcel(finalData, "Medical_Analysis", columnWidths);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateColumnWidths = (data) => {
    const widths = new Map();

    // Get all unique column names
    const allColumns = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(key => allColumns.add(key));
    });

    // Calculate maximum width for each column
    allColumns.forEach(column => {
      const maxLength = Math.max(
        column.length,
        ...data.map(row => String(row[column] || "").length)
      );
      widths.set(column, Math.min(50, Math.max(15, maxLength * 1.2))); // Limit width between 15 and 50
    });

    return widths;
  };


  const addIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: [...(prev[standardName] || []), variant]
    }));
  };



  const handleAddMapping = (newIndicator) => {
    setValidIndicators(prev => [...prev, newIndicator]);
    setIndicatorMappings(prev => ({
      ...prev,
      [newIndicator]: []
    }));
  };


  const handleDeleteMapping = (indicatorName) => {
    setValidIndicators(prev => prev.filter(indicator => indicator !== indicatorName));
    setIndicatorMappings(prev => {
      const { [indicatorName]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => !extractDateFromFilename(file.name));
    if (invalidFiles.length > 0) {
      alert('Некоторые файлы имеют неверный формат даты в названии. Поддерживаемые форматы:\nYYYYMMDD\nDDMMYYYY\nYYYY.MM.DD\nDD.MM.YYYY\nYYYY MM DD\nDD MM YYYY');
      return;
    }

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

  const deleteIndicatorVariant = (standardName, variant) => {
    setIndicatorMappings(prev => ({
      ...prev,
      [standardName]: prev[standardName].filter(v => v !== variant)
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Загрузка PDF файлов с анализами</h2>
        <button
          type="button"
          onClick={() => setShowMappings(!showMappings)}
          className="file-input"
        >
          {showMappings ? 'Скрыть настройки' : 'Настройки показателей'}
        </button>

        {showMappings && (
          <IndicatorMappingsManager
            mappings={indicatorMappings}
            onAddMapping={handleAddMapping}
            onAddVariant={addIndicatorVariant}
            onDeleteMapping={handleDeleteMapping}
            onDeleteVariant={deleteIndicatorVariant}
          />
        )}
      </div>

      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="file-input "
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