import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FieldShell from "./FieldShell";
import "./PhoneField.css";

/**
 * Champ "Téléphone" autonome : préfixe +216, chiffres uniquement,
 * validation 8 chiffres, refuse les numéros composés uniquement de zéros.
 * Ref -> { validate() }
 */
const PhoneField = forwardRef(function PhoneField(
  { value, onChange, label = <>Téléphone <small>(optionnel)</small></> },
  ref
) {
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  const shake = () => {
    boxRef.current?.animate(
      [{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }],
      { duration: 240 }
    );
  };

  const validate = () => {
    let e = "";
    if (value) {
      if (value.length !== 8) e = "8 chiffres attendus.";
      else if (/^0+$/.test(value)) e = "Numéro invalide.";
    }
    setError(e);
    if (e) shake();
    return e;
  };

  useImperativeHandle(ref, () => ({ validate }));

  const handle = (e) => onChange(e.target.value.replace(/\D/g, ""));

  return (
    <FieldShell ref={boxRef} id="phone" label={label} error={error}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
      <span className="pre">+216</span>
      <input
        id="phone"
        inputMode="numeric"
        maxLength={8}
        value={value}
        onChange={handle}
        placeholder="22 123 456"
      />
    </FieldShell>
  );
});

export default PhoneField;