import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FieldShell from "./FieldShell";
import "./EmailField.css";

/**
 * Champ "Email" autonome (validation incluse).
 * Ref -> { validate() }
 */
const EmailField = forwardRef(function EmailField({ value, onChange, label = "Email" }, ref) {
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  const shake = () => {
    boxRef.current?.animate(
      [{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }],
      { duration: 240 }
    );
  };

  const validate = () => {
    const e = /^\S+@\S+\.\S+$/.test(value.trim()) ? "" : "Email invalide.";
    setError(e);
    if (e) shake();
    return e;
  };

  useImperativeHandle(ref, () => ({ validate }));

  return (
    <FieldShell ref={boxRef} id="email" label={label} required error={error}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
      <input
        id="email"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="nom@exemple.com"
        autoComplete="email"
      />
    </FieldShell>
  );
});

export default EmailField;