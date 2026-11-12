import "./StepsIndicator.css";

/**
 * Indicateur d'étapes : 1 — 2 — 3 avec barres de progression.
 * Props : step (index courant), total
 */
export default function StepsIndicator({ step, total = 3 }) {
  return (
    <div className="steps">
      {Array.from({ length: total }, (_, i) => (
        <div className="steps-item" key={i} style={{ display: "contents" }}>
          <div className={"sn" + (i <= step ? " on" : "")}>{i + 1}</div>
          {i < total - 1 && (
            <div className={"sl" + (i < step ? " on" : "")}>
              <i />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}