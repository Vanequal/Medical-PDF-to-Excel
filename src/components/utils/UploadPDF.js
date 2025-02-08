import React, { useState } from "react";
import "../../styles/uploadPDF.css";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const UploadPDF = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const indicators = [
    "ОАК",
    "СОЭ",
    "эритроциты",
    "гемоглобин",
    "гематокрит",
    "средний обьем эритроцитов (MCV)",
    "среднее сод.гемоглобина в эритроцитах (MCH)",
    "Средняя концентрация гемоглобина в эритроцитах (MCHC)",
    "распределение эритроцитов по объему (RDW-SD)",
    "распределение эритроцитов по объему вариабельности",
    "тромбоциты",
    "тромбоциты %",
    "средний объем тромбоцитов (MPV)",
    "коэффициент больших тромбоцитов",
    "лейкоциты",
    "нейтрофилы",
    "лимфоциты",
    "моноциты",
    "эозинофилы",
    "базофилы",
    "нейтрофилы %",
    "лимфоциты %",
    "моноциты %",
    "эозинофилы %",
    "базофилы %",
    "тироксин Т4 св",
    "ТТГ",
    "Т3 св",
    "анти ТПО",
    "паратгормон",
    "биохимические показатели",
    "общий белок",
    "альбумин",
    "% соотношение",
    "белковые фракции",
    "альбумин %",
    "альфа-1-глобулин",
    "альфа-1-глобулин %",
    "альфа-2-глобулин",
    "альфа-2-глобулин %",
    "бета-1-глобулин",
    "бета-1-глобулин %",
    "бета-2-глобулин",
    "бета-2-глобулин %",
    "гамма-глобулин",
    "гамма-глобулин %",
    "билирубин непрямой",
    "билирубин прямой",
    "билирубин общий",
    "АЛТ",
    "АСТ",
    "коэффициент де Ритиса (АСТ/АЛТ 1,33)",
    "ГГТ",
    "глюкоза",
    "гликированный гемоглобин",
    "инсулин",
    "щелочная фосфатаза",
    "железо сывороточное",
    "ферритин",
    "трансферрин",
    "ЛПВП",
    "ЛПНП",
    "ЛПОНП",
    "триглицериды",
    "не ЛПВП",
    "общий холестерин",
    "липопротеин А",
    "коэффициент атерогенности",
    "СРБ",
    "В12 (цианокобаламин)",
    "гомоцистеин 10,26",
    "витамин Д (25-ОН)",
    "мочевая кислота",
    "креатинин",
    "мочевина",
    "кальций общий",
    "магний",
    "цинк",
    "фосфор",
    "натрий",
    "калий",
    "лактат",
    "ЛДГ",
    "аминокислоты",
    "1-метилгистидин",
    "3-метилгистидин",
    "α-аминоадипиновая кислота (AAA)",
    "α-аминомасляная кислота",
    "β-аланин",
    "β-аминоизомасляная кислота",
    "γ-аминомасляная кислота",
    "аланин",
    "алло-изолейцин",
    "ансерин",
    "аргинин",
    "аргинин-янтарная кислота",
    "аспарагин",
    "аспарагиновая кислота",
    "валин",
    "гидроксилизин",
    "гидроксипролин",
    "гистидин",
    "глицин",
    "глутамин",
    "глутаминовая кислота",
    "гомоцистеин",
    "гомоцитрулин",
    "изолейцин",
    "карнозин",
    "лейцин",
    "лизин",
    "метионин",
    "орнитин",
    "пипеколиновая кислота",
    "пролин",
    "саркозин",
    "серин",
    "таурин",
    "тирозин",
    "треонин",
    "триптофан",
    "фенилаланин",
    "фосфосерин",
    "фосфоэтаноламин",
    "цистотионин",
    "цистин",
    "цитрулин",
    "этаноламин",
    "органические кислоты",
    "молочная кислота",
    "пировиноградная кислота",
    "лимонная кислота",
    "цис-аконитовая кислота",
    "изолимонная кислота",
    "2-кетоглутаровая кислота",
    "янтарная кислота",
    "фумаровая кислота",
    "яблочная кислота",
    "2-метилгипуровая кислота (метаболит янтарной)",
    "ацетоуксусная кислота",
    "3-гидроксимасляная кислота",
    "малоновая кислота",
    "разветвленные аминокислоты",
    "2-гидрокси-3-метилбутановая кислота",
    "3-метилкротанилглицин",
    "3-метилглутаровая кислота",
    "изовалеринглицин",
    "пара-гидроксифенилмолочная кислота",
    "пара-гидроксифенилпировиноградная кислота",
    "гомогентизиновая кислота",
    "3-фенилмолочная кислота",
    "фенилглиоксиловая кислота",
    "миндальная кислота",
    "метаболизм триптофана",
    "квинолиновая кислота",
    "пиколиновая кислота",
    "оксалаты",
    "гликолиевая кислота",
    "глицериновая кислота",
    "щавелевая кислота",
    "2-кетоизовалериановая кислота",
    "3-метил-2-оксавалериановая кислота",
    "4-метил-2-оксавалериановая кислота",
    "3-гидроксиизовалериановая кислота",
    "3-гидрокси-3-метилглутаровая кислота",
    "формиминоглутаминовая кислота",
    "метилмалоновая кислота",
    "2-гидроксимасляная кислота",
    "пироглутаминовая кислота",
    "N-Ацетил-L-аспарагиновая кислота",
    "оротовая кислота",
    "маркеры токсичности",
    "гиппуровая кислота",
    "метилгиппуровая кислота",
    "фенилглиоксиловая кислота",
    "бензойная кислота",
    "орто-гидроксифенилуксусная кислота",
    "пара-гидроксибензойная кислота",
    "мета-метилгиппуровая кислота",
    "трикарбаллиловая кислота",
    "3-индолилуксусная кислота",
    "кофейная кислота",
    "винная кислота",
    "2-гидрокси-2-метилбутандионовая кислота",
    "соотношение квинолиновая/ксантуреновая кислоты"
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    processPdfFiles(files);
  };

  const extractDate = (text) => {
    const dateRegex = /Дата взятия образца:\s*(\d{2}\.\d{2}\.\d{4})/;
    const match = text.match(dateRegex);
    return match ? match[1] : null;
  };

  const processPdfFiles = async (files) => {
    setLoading(true);
    const allResults = {};

    for (const file of files) {
      try {
        const pdfData = await file.arrayBuffer();
        const pages = await convertPdfToImages(pdfData);

        let fileText = "";
        for (const pageImage of pages) {
          const text = await extractTextWithTesseract(pageImage);
          fileText += text;
        }

        const date = extractDate(fileText);
        if (!date) continue;

        const filteredText = filterNoise(fileText);
        const analysisData = parsePdfData(filteredText);

        allResults[date] = analysisData;
      } catch (error) {
        console.error(`Ошибка обработки файла ${file.name}:`, error);
      }
    }

    const formattedData = formatDataForExcel(allResults);
    exportToExcel(formattedData, "Medical_Analysis");
    setLoading(false);
  };
  const formatDataForExcel = (allResults) => {
    const dates = Object.keys(allResults).sort();
    const formattedData = [];

    const headers = {
      "Показатель": "",
    };

    dates.forEach(date => {
      headers[`Значение (${date})`] = "";
    });

    headers["Единицы"] = "";
    headers["Референсные значения"] = "";

    indicators.forEach(indicator => {
      const row = { ...headers };
      row["Показатель"] = indicator;

      dates.forEach(date => {
        const result = allResults[date].find(item => {
          const normalizedIndicator = indicator.toLowerCase().trim();
          const normalizedResearch = item.Исследование.toLowerCase().trim();

          return normalizedResearch.includes(normalizedIndicator) ||
            normalizedIndicator.includes(normalizedResearch);
        });

        if (result) {
          // Проверяем корректность значения перед добавлением
          if (validateValue(result.Результат, indicator)) {
            row[`Значение (${date})`] = result.Результат;
            row["Единицы"] = result.Единицы || row["Единицы"];
            row["Референсные значения"] = result["Референсные значения"] || row["Референсные значения"];
          } else {
            console.log(`Пропущено некорректное значение для ${indicator}:`, result.Результат);
          }
        }
      });

      formattedData.push(row);
    });

    return formattedData;
  };
  const exportToExcel = (data, fileName) => {
    if (!data || data.length === 0) {
      console.error("Нет данных для экспорта");
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(data);

      // Получаем количество столбцов из первой строки данных
      const columnCount = Object.keys(data[0]).length;

      // Создаем массив с настройками ширины для каждого столбца
      const wsCols = [
        { wch: 40 }, // Показатель
      ];

      // Добавляем настройки для столбцов с датами
      for (let i = 1; i < columnCount - 2; i++) {
        wsCols.push({ wch: 15 });
      }

      // Добавляем настройки для последних двух столбцов
      wsCols.push(
        { wch: 15 }, // Единицы
        { wch: 30 }  // Референсные значения
      );

      ws["!cols"] = wsCols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Анализы");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Ошибка при экспорте в Excel:", error);
    }
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
      logger: (info) => console.log(info), // Логи Tesseract
    });
    return result.data.text;
  };


  const filterNoise = (text) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        const noisePatterns = [
          /Дата взятия образца:/,
          /Дата поступления образца:/,
          /Дата печати результата:/,
          /Пол:/,
          /Возраст:/,
          /ИНЗ:/,
          /Врач:/,
          /ООО/,
          /www\./,
          /стр\./,
          /Комментарии к заявке:/,
          /Название принимаемых пациентом препаратов:/,
          /Хранение и транспортировка/,
          /Результаты исследований не являются диагнозом/,
          /Внимание!/,
          /фибриногена до/,
          /^[А-Яа-я]+(\s+[А-Яа-я]+){1,2}$/
        ];

        const isNoise = noisePatterns.some((pattern) => pattern.test(line));
        if (isNoise) {
          console.log("Удалено как шум:", line); // Отладочный вывод
        }
        return !isNoise;
      });
    return lines.join("\n");
  };

  const parsePdfData = (text) => {
    const isValidLine = (line) => /\d/.test(line);
    const lines = mergeBrokenLines(text)
      .split("\n")
      .map((line) => line.trim())
      .filter(isValidLine);

    const data = [];
    // Улучшенное регулярное выражение для десятичных чисел
    const regex = /^(.*?[а-яА-Яa-zA-Z].*?)\s+((?:\d+(?:[,.]\d+)?)|(?:\d+(?:[,.]\d+)?\s*[-–]\s*\d+(?:[,.]\d+)?))\s*(г\/л|сек|%|ммоль\/л|мг\/л|ед\/л|ед\/мл|мкмоль\/л|кПа|мл\/мин|мг\/дл|мкг\/мл|фл|кл|пг|10\*[\d]+|[а-яА-Яa-zA-Z]*)?(?:\s*((?:\d+(?:[,.]\d+)?\s*[-–]\s*\d+(?:[,.]\d+)?)|(?:\d+(?:[,.]\d+)?(?:\s*[<>]\s*\d+(?:[,.]\d+)?)?)))?$/;

    console.log("Текст после предварительной обработки:", text); // Отладочный вывод

    lines.forEach((line) => {
      const match = line.match(regex);
      console.log("Обработка строки:", line); // Отладочный вывод

      if (match) {
        let [fullMatch, research, result, unit, reference] = match;
        console.log("Найдено совпадение:", { fullMatch, research, result, unit, reference }); // Отладочный вывод

        // Очистка и нормализация данных
        research = research?.trim() || "Неизвестное исследование";
        // Обработка десятичных чисел с учетом запятых и точек
        result = result?.trim().replace(/,/g, ".") || "Нет результата";
        unit = unit?.trim() || "";
        reference = reference?.trim().replace(/,/g, ".") || "";

        // Дополнительная проверка на корректность десятичных чисел
        if (result.includes(".")) {
          const [whole, decimal] = result.split(".");
          if (decimal && decimal.length > 3) {
            console.log("Подозрительное десятичное число:", result);
          }
        }

        // Проверка специфических показателей
        const normalizedResearch = research.toLowerCase();
        if (normalizedResearch.includes("базофил")) {
          console.log("Обнаружены базофилы:", { research, result });
        }

        data.push({
          Исследование: research,
          Результат: result,
          Единицы: unit,
          "Референсные значения": reference,
        });
      } else {
        console.log("Не удалось распознать строку:", line);
      }
    });

    // Отладочный вывод всех распознанных данных
    console.log("Распознанные данные:", data);

    return data;
  };
  const validateValue = (value, indicator) => {
    const normalizedValue = parseFloat(value.replace(",", "."));
    const normalizedIndicator = indicator.toLowerCase();
    return true;
  };


  const mergeBrokenLines = (text) => {
    const lines = text.split("\n");
    const mergedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i].trim();
      const next = lines[i + 1]?.trim();

      // Проверяем, не разорвана ли строка
      if (current && next && !/\d/.test(current) && !/:/.test(current) && /\d/.test(next)) {
        mergedLines.push(`${current} ${next}`);
        i++; // Пропускаем следующую строку
      } else {
        mergedLines.push(current);
      }
    }

    return mergedLines.join("\n");
  };


  return (
    <div className="pdf-upload-container">
      <h2>Загрузка PDF файлов</h2>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileUpload}
        className="pdf-upload-input"
      />
      {loading && <p>Обработка файлов, пожалуйста, подождите...</p>}
    </div>
  );
};

export default UploadPDF;
