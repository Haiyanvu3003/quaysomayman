import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./index.css";

export default function App() {
  const [codes, setCodes] = useState([]); // [{ code: "A", quantity: 10, probability: 20 }]
  const [displayNumber, setDisplayNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Load từ localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("history");
    const storedCodes = localStorage.getItem("codes");
    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedCodes) setCodes(JSON.parse(storedCodes));
  }, []);

  // Lưu khi thay đổi
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("codes", JSON.stringify(codes));
  }, [codes]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const newCodes = [];
      jsonData.forEach((row) => {
        const code = row.Code;
        const quantity = Number(row.Quantity);
        const probability = Number(row.Probability);
        if (code && quantity > 0 && probability > 0) {
          newCodes.push({ code, quantity, probability });
        }
      });

      setCodes(newCodes);
      setHistory([]); // Reset khi upload file mới
    };

    if (file) reader.readAsArrayBuffer(file);
  };

  const pickWinner = () => {
    // Bỏ các mã hết quantity
    const available = codes.filter((item) => item.quantity > 0);
    if (available.length === 0) return null;

    // Tính tổng trọng số
    const totalProb = available.reduce((sum, item) => sum + item.probability, 0);

    const rand = Math.random() * totalProb;
    let cumulative = 0;
    for (const item of available) {
      cumulative += item.probability;
      if (rand <= cumulative) {
        return item.code;
      }
    }
    // fallback
    return available[available.length - 1].code;
  };

  const handleDraw = () => {
    if (codes.filter((c) => c.quantity > 0).length === 0) {
      alert("Danh sách mã đã hết hoặc chưa upload!");
      return;
    }

    setIsDrawing(true);
    let elapsed = 0;
    const intervalDuration = 100;
    const interval = setInterval(() => {
      elapsed += intervalDuration;
      const sample = pickWinner() || "";
      setDisplayNumber(sample);

      if (elapsed >= 5000) {
        clearInterval(interval);

        const winner = pickWinner();
        if (winner) {
          setDisplayNumber(winner);
          setHistory((prev) => [...prev, winner]);
          setCodes((prev) =>
            prev.map((item) =>
              item.code === winner
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
          );
        }

        setIsDrawing(false);
      }
    }, intervalDuration);
  };

  return (
    <>
      <div className="app-container">
        <div className="button-group">
          <button
            onClick={handleDraw}
            disabled={isDrawing}
            className="draw-button"
          >
            {isDrawing ? "Đang quay số..." : "✨ BẮT ĐẦU QUAY SỐ ✨"}
          </button>
        </div>

        <div className="draw-container">
          {displayNumber && (
            <div className="draw-inner">
              <p className="draw-title">Mã trúng thưởng:</p>
              <p
                className={
                  isDrawing
                    ? "running-number draw-code"
                    : "blinking-text draw-code"
                }
              >
                🎊 {displayNumber} 🎊
              </p>
            </div>
          )}
        </div>

        <div className="upload-container">
          <button
            className="upload-toggle"
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? "▲" : "▼"}
          </button>
          {showUpload && (
            <div className="upload-inner">
              <label htmlFor="file-upload" className="file-upload-label">
                📁 Tải Danh Sách Mã Dự Thưởng
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
