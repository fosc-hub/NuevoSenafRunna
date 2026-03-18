"use client";
import { useState } from "react";

const scheduleData = [
  {
    day: "LUNES",
    blocks: [
      { time: "13:30 - 15:30", subject: "Ing. de Software II", type: "Teoría B", year: "4to", option: "Op. 2", color: "#2563eb", conflict: false },
      { time: "16:00 - 18:00", subject: "Admin. Proy. de SW", type: "Teoría A", year: "5to", option: "—", color: "#7c3aed", conflict: false },
      { time: "18:00 - 20:00", subject: "Admin. Proy. de SW", type: "Práctica A2", year: "5to", option: "—", color: "#7c3aed", conflict: false },
      { time: "20:00 - 22:00", subject: "Sist. Inteligentes", type: "Práctica A2 (+1HR AV)", year: "5to", option: "—", color: "#0891b2", conflict: false },
    ],
  },
  {
    day: "MARTES",
    blocks: [
      { time: "13:30 - 15:30", subject: "Prog. de Videojuegos", type: "T/P Electiva 2", year: "4to", option: "Op. 2", color: "#d97706", conflict: false },
      { time: "16:00 - 18:00", subject: "Sistemas Operativos", type: "Teoría B (+1HR AV)", year: "4to", option: "Op. 2", color: "#059669", conflict: false, sacrificable: true },
      {
        time: "18:30 - 21:45",
        subject: "Ing. Software II (P) / Ing. Legal",
        type: "SOLAPAMIENTO",
        year: "4to / 5to",
        option: "Op. 2 / —",
        color: "#dc2626",
        conflict: true,
        details: [
          { subject: "Ing. de Software II", type: "Práctica B", year: "4to Op. 2", color: "#2563eb" },
          { subject: "Ingeniería Legal", type: "T/P A1 ó A2", year: "5to", color: "#be185d" },
        ],
      },
    ],
  },
  {
    day: "MIÉRCOLES",
    blocks: [
      { time: "10:30 - 12:30", subject: "Seminario Form. Humanística", type: "T/P A2", year: "5to", option: "—", color: "#4f46e5", conflict: false },
      { time: "13:30 - 15:30", subject: "Ética y Deontología Prof.", type: "T/P A2", year: "5to", option: "—", color: "#9333ea", conflict: false },
      {
        time: "16:00 - 18:00",
        subject: "Electiva 2 / Sist. Inteligentes",
        type: "SOLAPAMIENTO",
        year: "4to / 5to",
        option: "Op. 2 / —",
        color: "#dc2626",
        conflict: true,
        details: [
          { subject: "Prog. de Videojuegos", type: "T/P Electiva 2", year: "4to Op. 2", color: "#d97706" },
          { subject: "Sist. Inteligentes", type: "Teoría A", year: "5to", color: "#0891b2" },
        ],
      },
    ],
  },
  {
    day: "JUEVES",
    blocks: [
      { time: "13:30 - 16:45", subject: "Sistemas Operativos", type: "Práctica B2 (C. Comp.)", year: "4to", option: "Op. 2", color: "#059669", conflict: false, sacrificable: true },
    ],
  },
  {
    day: "VIERNES",
    blocks: [],
  },
];

const subjectSummary = [
  { subject: "Ing. de Software II", year: "4to", option: "Opción 2", sessions: "LUN (T) + MAR (P)", hasConflict: true, conflictNote: "Práctica se solapa con Ing. Legal el martes" },
  { subject: "Prog. de Videojuegos", year: "4to", option: "Electiva 2", sessions: "MAR (T/P) + MIÉ (T/P)", hasConflict: true, conflictNote: "Sesión del miércoles se solapa con Sist. Inteligentes T" },
  { subject: "Sistemas Operativos", year: "4to", option: "Opción 2", sessions: "MAR (T) + JUE (P)", hasConflict: false, sacrificable: true },
  { subject: "Ética y Deontología", year: "5to", option: "Cát. A2", sessions: "MIÉ (T/P)", hasConflict: false },
  { subject: "Seminario Form. Human.", year: "5to", option: "Cát. A2", sessions: "MIÉ (T/P)", hasConflict: false },
  { subject: "Ingeniería Legal", year: "5to", option: "Cát. A1 ó A2", sessions: "MAR (T/P)", hasConflict: true, conflictNote: "Se solapa con ISW II Práctica el martes" },
  { subject: "Admin. Proy. de SW", year: "5to", option: "Práct. A2", sessions: "LUN (T) + LUN (P)", hasConflict: false },
  { subject: "Sist. Inteligentes", year: "5to", option: "Práct. A2", sessions: "MIÉ (T) + LUN (P)", hasConflict: true, conflictNote: "Teoría se solapa con Electiva 2 el miércoles" },
];

function TimeBlock({ block, expanded, onToggle }) {
  const isConflict = block.conflict;
  const isSacrificable = block.sacrificable;

  return (
    <div
      onClick={isConflict ? onToggle : undefined}
      style={{
        position: "relative",
        borderRadius: "10px",
        padding: "12px 14px",
        marginBottom: "8px",
        background: isConflict
          ? "repeating-linear-gradient(135deg, #fef2f2, #fef2f2 8px, #fff1f2 8px, #fff1f2 16px)"
          : `linear-gradient(135deg, ${block.color}11, ${block.color}08)`,
        border: isConflict
          ? "2px solid #fca5a5"
          : isSacrificable
          ? `1.5px dashed ${block.color}55`
          : `1.5px solid ${block.color}30`,
        cursor: isConflict ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: isConflict ? "#991b1b" : block.color, letterSpacing: "0.02em", marginBottom: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
            {block.time}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: isConflict ? "#dc2626" : "#1e293b", lineHeight: 1.3, marginBottom: "3px" }}>
            {isConflict ? "⚠️ " : ""}{block.subject}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "4px",
              background: isConflict ? "#fee2e2" : `${block.color}18`,
              color: isConflict ? "#b91c1c" : block.color,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}>
              {block.type}
            </span>
            <span style={{
              fontSize: "10px",
              fontWeight: 500,
              color: "#94a3b8",
            }}>
              {block.year}
              {block.option && block.option !== "—" ? ` · ${block.option}` : ""}
            </span>
            {isSacrificable && (
              <span style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "4px",
                background: "#fef3c7",
                color: "#92400e",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                SACRIFICABLE
              </span>
            )}
          </div>
        </div>
      </div>

      {isConflict && expanded && block.details && (
        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #fca5a5" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#991b1b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Materias en conflicto:
          </div>
          {block.details.map((d, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 10px",
              marginBottom: "4px",
              borderRadius: "6px",
              background: `${d.color}10`,
              border: `1px solid ${d.color}25`,
            }}>
              <div style={{ width: "4px", height: "28px", borderRadius: "2px", background: d.color }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{d.subject}</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>{d.type} · {d.year}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HorarioSemanal() {
  const [expandedConflicts, setExpandedConflicts] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const toggleConflict = (key) => {
    setExpandedConflicts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
      minHeight: "100vh",
      padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Horario Semanal — S1 2026
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, fontWeight: 500 }}>
            Ing. Informática · 4to + 5to año combinados
          </p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fef2f2, #fff7ed)",
          border: "1.5px solid #fecaca",
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>⚡</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>
              2 solapamientos inevitables detectados
            </div>
            <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: 1.5 }}>
              <strong>MAR 18:30–21:45:</strong> ISW II Práctica vs Ing. Legal — ambas solo en ese horario.
              <br />
              <strong>MIÉ 16:00–18:00:</strong> Electiva 2 (2da sesión) vs Sist. Inteligentes Teoría.
              <br />
              <span style={{ color: "#92400e", fontStyle: "italic" }}>Tocá los bloques rojos para ver el detalle.</span>
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}>
          {scheduleData.map((day) => (
            <div key={day.day} style={{
              background: "#ffffff",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              minHeight: "120px",
            }}>
              <div style={{
                padding: "10px 14px",
                background: day.blocks.length === 0
                  ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                  : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                borderBottom: "1px solid #e2e8f0",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: day.blocks.length === 0 ? "#059669" : "#334155",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {day.day}
                </div>
                {day.blocks.length === 0 && (
                  <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                    🎉 LIBRE
                  </div>
                )}
              </div>
              <div style={{ padding: "10px" }}>
                {day.blocks.map((block, i) => {
                  const key = `${day.day}-${i}`;
                  return (
                    <TimeBlock
                      key={key}
                      block={block}
                      expanded={!!expandedConflicts[key]}
                      onToggle={() => toggleConflict(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <button
            onClick={() => setShowSummary(!showSummary)}
            style={{
              background: showSummary ? "#1e293b" : "#ffffff",
              color: showSummary ? "#ffffff" : "#334155",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
          >
            {showSummary ? "Ocultar resumen" : "Ver resumen por materia"}
          </button>
        </div>

        {showSummary && (
          <div style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              borderBottom: "1px solid #e2e8f0",
            }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Resumen por materia</div>
            </div>
            <div style={{ padding: "4px 0" }}>
              {subjectSummary.map((s, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 0.6fr 0.8fr 1.2fr",
                  padding: "10px 18px",
                  borderBottom: i < subjectSummary.length - 1 ? "1px solid #f1f5f9" : "none",
                  alignItems: "center",
                  gap: "8px",
                  background: s.hasConflict ? "#fef2f210" : "transparent",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                      {s.hasConflict ? "⚠️ " : s.sacrificable ? "🔸 " : "✅ "}{s.subject}
                    </div>
                    {s.conflictNote && (
                      <div style={{ fontSize: "10px", color: "#dc2626", marginTop: "2px", fontWeight: 500 }}>
                        {s.conflictNote}
                      </div>
                    )}
                    {s.sacrificable && (
                      <div style={{ fontSize: "10px", color: "#92400e", marginTop: "2px", fontWeight: 500 }}>
                        Se puede sacrificar si es necesario
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>{s.year}</div>
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8" }}>{s.option}</div>
                  <div style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#334155",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{s.sessions}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          marginTop: "16px",
          background: "linear-gradient(135deg, #eff6ff, #eef2ff)",
          border: "1.5px solid #bfdbfe",
          borderRadius: "12px",
          padding: "16px 18px",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e40af", marginBottom: "8px" }}>
            💡 Recomendaciones para los solapamientos
          </div>
          <div style={{ fontSize: "12px", color: "#1e3a5f", lineHeight: 1.7 }}>
            <strong>1. Martes 18:30–21:45 (ISW II P vs Ing. Legal):</strong> Ambas materias tienen UNA SOLA opción de horario y caen en el mismo bloque. Vas a tener que alternar semanas o hablar con los profesores para buscar algún arreglo. Si te obligan a elegir una: Ing. Legal es T/P (no se repite), ISW II tiene teoría separada el lunes.
            <br /><br />
            <strong>2. Miércoles 16:00–18:00 (Electiva 2 vs Sist. Int. Teoría):</strong> La 2da sesión de Prog. Videojuegos cae con la teoría de Sist. Inteligentes. Ya tenés la práctica de Sist. Int. los lunes, así que podrías ir al teórico de Sist. Int. semanas alternadas y compensar con material.
            <br /><br />
            <strong>SO es sacrificable</strong> como pediste — sacarlo libera el martes 16:00–18:00 y todo el jueves, pero no resuelve los 2 solapamientos.
          </div>
        </div>
      </div>
    </div>
  );
}
