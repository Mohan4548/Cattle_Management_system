import React from 'react';

interface QRCodeProps {
  data: string;
  size?: number;
}

export const QRCodeSVG: React.FC<QRCodeProps> = ({ data, size = 120 }) => {
  // Simple deterministic SVG QR code pattern generator based on data string hash
  const getMatrix = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const size = 15;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Corner alignment boxes
        if (
          (r < 4 && c < 4) ||
          (r < 4 && c >= size - 4) ||
          (r >= size - 4 && c < 4)
        ) {
          row.push((r === 0 || r === 3 || c === 0 || c === 3 || (r === 2 && c === 2)));
        } else {
          const bit = (hash + r * 17 + c * 31) % 3 === 0;
          row.push(bit);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const matrix = getMatrix(data || 'FE-CAT-2026-001');
  const cellSize = size / matrix.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-2 rounded-xl shadow-inner border border-slate-200">
      {matrix.map((row, r) =>
        row.map((cell, c) => (
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              fill="#0f172a"
              rx={1}
            />
          ) : null
        ))
      )}
    </svg>
  );
};
