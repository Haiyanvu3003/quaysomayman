import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./index.css";

// ✅ Danh sách mã trúng thưởng cố định (ưu tiên)
const fixedWinners = ["242","001"];

export default function App() {
  const [codes, setCodes] = useState([]);
  const [displayNumber, setDisplayNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const storedHistory = localStorage.getItem("history");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const codeList = jsonData.map((row) => row.Code).filter(Boolean);
      setCodes(codeList);
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDraw = () => {
    if (codes.length === 0) {
      alert("Danh sách mã dự thưởng đã hết hoặc chưa được tải lên!");
      return;
    }

    setIsDrawing(true);
    let elapsed = 0;
    const intervalDuration = 100;
    const interval = setInterval(() => {
      elapsed += intervalDuration;
      const randomIndex = Math.floor(Math.random() * codes.length);
      setDisplayNumber(codes[randomIndex]);

      if (elapsed >= 5000) {
        clearInterval(interval);

        let selectedWinner;

        // ✅ Nếu còn mã trong danh sách cố định thì dùng trước
        const winnerFromFixed = fixedWinners.find((code) => codes.includes(code));
        if (winnerFromFixed) {
          selectedWinner = winnerFromFixed;
        } else {
          const randomFinalIndex = Math.floor(Math.random() * codes.length);
          selectedWinner = codes[randomFinalIndex];
        }

        setDisplayNumber(selectedWinner);
        setHistory((prev) => [...prev, selectedWinner]);
        setCodes((prev) => prev.filter((code) => code !== selectedWinner));

        // ✅ Loại khỏi danh sách cố định nếu vừa dùng
        const fixedIndex = fixedWinners.indexOf(selectedWinner);
        if (fixedIndex !== -1) {
          fixedWinners.splice(fixedIndex, 1);
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
      <p className={isDrawing ? "running-number draw-code" : "blinking-text draw-code"}>
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
