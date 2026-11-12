import { forwardRef } from "react";
import "./FieldShell.css";

/**
 * Coquille commune à tous les champs : label + zone de saisie + message d'erreur.
 * Ref = la zone de saisie (pour l'animation shake).
 */
const FieldShell = forwardRef(function FieldShell({ id, label, required, error, children }, ref) {
  return (
    <div className="fld">
      <label htmlFor={id}>
        {label} {required && <i>*</i>}
      </label>
      <div ref={ref} className={"fld-in" + (error ? " bad" : "")}>{children}</div>
      <div className="fld-err">{error}</div>
    </div>
  );
});

export default FieldShell;