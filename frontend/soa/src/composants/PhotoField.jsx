import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import "./PhotoField.css";

// Doit correspondre aux règles du backend (jpeg / png / webp, 2 Mo max)
const MAX_SIZE = 2 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Champ "Photo" autonome : sélection + validation type/taille.
 * La photo est facultative : sans fichier, validate() ne renvoie jamais d'erreur.
 * Ref -> { validate(), file() }
 */
const PhotoField = forwardRef(function PhotoField({ onPreview }, ref) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  const shake = () => {
    dropRef.current?.animate(
      [
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "none" },
      ],
      { duration: 240 },
    );
  };

  const validate = () => {
    if (error) shake();
    return error;
  };

  useImperativeHandle(ref, () => ({ validate, file: () => file }));

  // Fichier refusé : on vide la sélection pour ne pas garder une ancienne photo
  const reject = (message) => {
    setError(message);
    setFile(null);
    onPreview?.(null);
    if (inputRef.current) inputRef.current.value = "";
    shake();
  };

  const onChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!TYPES.includes(f.type))
      return reject("Format non accepté (JPG, PNG ou WebP).");
    if (f.size > MAX_SIZE) return reject("Image trop lourde (2 Mo max).");
    setError("");
    setFile(f);
    onPreview?.(URL.createObjectURL(f));
  };

  const remove = () => {
    setFile(null);
    setError("");
    onPreview?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="photo-field">
      <label
        ref={dropRef}
        className={"photo-drop" + (error ? " bad" : "")}
        htmlFor="photo"
      >
        <input
          ref={inputRef}
          id="photo"
          type="file"
          accept={TYPES.join(",")}
          onChange={onChange}
        />
        <b>{file ? file.name : "Choisir une image"}</b>
        <br />
        <small>JPG, PNG, WebP · 2 Mo max · optionnel</small>
      </label>
      <div className="photo-err">{error}</div>
      {file && (
        <button type="button" className="photo-remove" onClick={remove}>
          Retirer la photo
        </button>
      )}
    </div>
  );
});

export default PhotoField;
