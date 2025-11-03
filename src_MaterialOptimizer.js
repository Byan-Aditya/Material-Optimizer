import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Simple Material Optimizer React Component
export default function MaterialOptimizer() {
  const [shape, setShape] = useState("circle");
  const [sheetW, setSheetW] = useState(1000); // mm
  const [sheetH, setSheetH] = useState(600); // mm
  const [spacing, setSpacing] = useState(5); // mm

  // circle inputs
  const [od, setOd] = useState(50);
  const [id, setId] = useState(20);
  const [thickness, setThickness] = useState(3);

  // rectangle / square inputs
  const [partW, setPartW] = useState(50);
  const [partL, setPartL] = useState(50);
  const [partH, setPartH] = useState(3);

  // number of generated parts and positions
  const placements = useMemo(() => {
    const places = [];
    let footprintX = 0;
    let footprintY = 0;
    if (shape === "circle") {
      footprintX = od;
      footprintY = od;
    } else if (shape === "square") {
      footprintX = partW;
      footprintY = partW;
    } else {
      // rectangle
      footprintX = partL;
      footprintY = partW;
    }

    const cellX = footprintX + spacing;
    const cellY = footprintY + spacing;

    const cols = Math.floor((sheetW + spacing) / cellX);
    const rows = Math.floor((sheetH + spacing) / cellY);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -sheetW / 2 + cellX * c + footprintX / 2;
        const y = -sheetH / 2 + cellY * r + footprintY / 2;
        places.push({ x, y });
      }
    }

    return places;
  }, [shape, sheetW, sheetH, spacing, od, partW, partL]);

  // helper to render a single part
  function PartMesh({ x, y, idx }) {
    const z = 0; // on top of sheet
    if (shape === "circle") {
      // render outer cylinder and inner cylinder to simulate hole
      return (
        <group position={[x / 1000, z / 1000, y / 1000]}>
          <mesh>
            <cylinderGeometry args={[od / 2000, od / 2000, thickness / 1000, 48]} />
            <meshStandardMaterial color="#ff8c00" />
          </mesh>
          {id > 0 && (
            <mesh position={[0, 0.001, 0]}>
              <cylinderGeometry args={[id / 2000, id / 2000, (thickness + 0.002) / 1000, 48]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          )}
        </group>
      );
    }

    // square / rectangle
    const w = shape === "square" ? partW : partL;
    const l = partW;
    return (
      <mesh position={[x / 1000, (partH / 2) / 1000, y / 1000]}>
        <boxGeometry args={[w / 1000, partH / 1000, l / 1000]} />
        <meshStandardMaterial color="#66ccff" />
      </mesh>
    );
  }

  return (
    <div className="flex h-full w-full gap-4 p-4">
      <div className="w-96 bg-white/90 rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Material Optimizer</h2>

        <label className="block mb-2">Pilih bentuk</label>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        >
          <option value="circle">Lingkaran (Ring)</option>
          <option value="square">Persegi</option>
          <option value="rectangle">Persegi Panjang</option>
        </select>

        <div className="mb-3">
          <label className="block">Ukuran lembar material (mm)</label>
          <div className="flex gap-2 mt-1">
            <input
              value={sheetW}
              onChange={(e) => setSheetW(Number(e.target.value))}
              className="w-1/2 p-2 border rounded"
              type="number"
            />
            <input
              value={sheetH}
              onChange={(e) => setSheetH(Number(e.target.value))}
              className="w-1/2 p-2 border rounded"
              type="number"
            />
          </div>
        </div>

        {shape === "circle" && (
          <div className="mb-3">
            <label>ID (mm)</label>
            <input
              value={id}
              onChange={(e) => setId(Number(e.target.value))}
              className="w-full p-2 border rounded mb-1"
              type="number"
            />
            <label>OD (mm)</label>
            <input
              value={od}
              onChange={(e) => setOd(Number(e.target.value))}
              className="w-full p-2 border rounded mb-1"
              type="number"
            />
            <label>Ketebalan (mm)</label>
            <input
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-full p-2 border rounded"
              type="number"
            />
          </div>
        )}

        {(shape === "square" || shape === "rectangle") && (
          <div className="mb-3">
            <label>Panjang (mm)</label>
            <input
              value={partL}
              onChange={(e) => setPartL(Number(e.target.value))}
              className="w-full p-2 border rounded mb-1"
              type="number"
            />
            <label>Lebar (mm)</label>
            <input
              value={partW}
              onChange={(e) => setPartW(Number(e.target.value))}
              className="w-full p-2 border rounded mb-1"
              type="number"
            />
            <label>Tinggi / Ketebalan (mm)</label>
            <input
              value={partH}
              onChange={(e) => setPartH(Number(e.target.value))}
              className="w-full p-2 border rounded"
              type="number"
            />
          </div>
        )}

        <div className="mb-3">
          <label>Spiling / Jarak antar bagian (mm)</label>
          <input
            value={spacing}
            onChange={(e) => setSpacing(Number(e.target.value))}
            className="w-full p-2 border rounded"
            type="number"
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Estimasi jumlah bagian:</strong>
          <div>{placements.length} buah</div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Note: algoritma packing sederhana (grid). Untuk nesting kompleks butuh algoritma khusus.
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden shadow-lg min-h-[400px]">
        <Canvas camera={{ position: [0, 1.5, 2.5] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          {/* sheet */}
          <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[sheetW / 1000, sheetH / 1000, 1, 1]} />
            <meshStandardMaterial color="#ddd" />
          </mesh>

          {/* render parts */}
          {placements.map((p, i) => (
            <PartMesh key={i} x={p.x} y={p.y} idx={i} />
          ))}

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}