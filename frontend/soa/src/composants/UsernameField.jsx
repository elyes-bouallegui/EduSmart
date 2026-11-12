import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FieldShell from "./FieldShell";
import "./UsernameField.css";

/**
 * Champ "Nom d'utilisateur" autonome (validation incluse).
 * Ref -> { validate(): renvoie "" si valide, sinon le message d'erreur }
 */
const UsernameField = forwardRef(function UsernameField({ value, onChange, label = "Nom d'utilisateur" }, ref) {
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  const shake = () => {
    boxRef.current?.animate(
      [{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }],
      { duration: 240 }
    );
  };

  const validate = () => {
    const e = value.trim().length < 3 ? "Minimum 3 caractères." : "";
    setError(e);
    if (e) shake();
    return e;
  };

  useImperativeHandle(ref, () => ({ validate }));

  return (
    <FieldShell ref={boxRef} id="username" label={label} required error={error}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
      <input
        id="username"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="testuser01"
        autoComplete="username"
      />
    </FieldShell>
  );
});

export default UsernameField;