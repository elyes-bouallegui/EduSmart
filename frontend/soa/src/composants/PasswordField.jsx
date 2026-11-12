import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FieldShell from "./FieldShell";
import "./PasswordField.css";

const COLORS = ["#dc2626", "#f59e0b", "#84cc16", "#16a34a"];

function strength(v) {
  let n = 0;
  if (v.length >= 8) n++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
  if (/\d/.test(v)) n++;
  if (/[^A-Za-z0-9]/.test(v)) n++;
  return n;
}

/**
 * Champ "Mot de passe" autonome : afficher/masquer + jauge de force + validation.
 * Ref -> { validate() }
 */
const PasswordField = forwardRef(function PasswordField(
  { value, onChange, label = "Mot de passe" },
  ref
) {
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const boxRef = useRef(null);

  const shake = () => {
    boxRef.current?.animate(
      [{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }],
      { duration: 240 }
    );
  };

  const validate = () => {
    const e = value.length < 8 ? "Minimum 8 caractères." : "";
    setError(e);
    if (e) shake();
    return e;
  };

  useImperativeHandle(ref, () => ({ validate }));

  const n = strength(value);

  return (
    <>
      <FieldShell ref={boxRef} id="password" label={label} required error={error}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <input
          id="password"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="8 caractères minimum"
          autoComplete="new-password"
        />
        <button type="button" onClick={() => setShow((s) => !s)}>
          {show ? "Masquer" : "Afficher"}
        </button>
      </FieldShell>
      <div className="pwd-meter">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ background: i < n ? COLORS[n - 1] : undefined }} />
        ))}
      </div>
    </>
  );
});
export default PasswordField;