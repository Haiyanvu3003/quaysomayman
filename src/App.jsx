import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./index.css";

export default function App() {
  const [codes, setCodes] = useState([]);
  const [displayNumber, setDisplayNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Lấy lịch sử từ localStorage khi component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("history");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Mỗi khi history thay đổi, lưu lại localStorage
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  // Xử lý upload file Excel
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      // Giả sử cột trong Excel tên "Code"
      const codeList = jsonData.map((row) => row.Code).filter(Boolean);
      setCodes(codeList);
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };

  // Xử lý quay số
  const handleDraw = () => {
    if (codes.length === 0) {
      alert("Danh sách mã dự thưởng đã hết hoặc chưa được tải lên!");
      return;
    }
    setIsDrawing(true);
    let elapsed = 0;
    const intervalDuration = 100; // cập nhật mỗi 100ms
    const interval = setInterval(() => {
      elapsed += intervalDuration;
      // Cập nhật số hiển thị liên tục
      const randomIndex = Math.floor(Math.random() * codes.length);
      setDisplayNumber(codes[randomIndex]);
      if (elapsed >= 5000) {
        clearInterval(interval);
        // Lấy số trúng thưởng cuối cùng
        const finalIndex = Math.floor(Math.random() * codes.length);
        const selectedWinner = codes[finalIndex];
        setDisplayNumber(selectedWinner);
        setHistory((prevHistory) => [...prevHistory, selectedWinner]);
        // Loại bỏ mã đã trúng khỏi danh sách
        const updatedCodes = codes.filter((_, idx) => idx !== finalIndex);
        setCodes(updatedCodes);
        setIsDrawing(false);
      }
    }, intervalDuration);
  };

  return (
    <div className="app-container">
      {/* Tiêu đề trên 1 dòng, có emoji */}
      <h1>🎉 Quay Số May Mắn 🎉</h1>

      {/* Nhóm nút quay số */}
      <div className="button-group">
        <button onClick={handleDraw} disabled={isDrawing}>
          {isDrawing ? "Đang quay số..." : "✨ BẮT ĐẦU QUAY SỐ ✨"}
        </button>
      </div>

      {/* Ô hiển thị mã trúng thưởng */}
      <div className="draw-container">
        {displayNumber && (
          <p className={!isDrawing ? "blinking-text" : ""}>
            {isDrawing
              ? `Đang quay số: ${displayNumber}`
              : `🎊 Mã trúng thưởng: ${displayNumber} 🎊`}
          </p>
        )}
      </div>

      {/* Nút mũi tên ẩn/hiện để upload file Excel */}
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
              📁 Tải file Excel
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

      {/* Ô hiển thị lịch sử trúng thưởng */}
      {history.length > 0 && (
        <div className="history">
          <h3>Lịch sử trúng thưởng:</h3>
          <ul>
            {history.map((code, index) => (
              <li key={index}>{code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
