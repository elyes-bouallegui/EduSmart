import { useEffect, useMemo, useRef, useState } from "react";
import "./Register.css";
import UsernameField from "../composants/UsernameField";
import EmailField from "../composants/EmailField";
import PasswordField from "../composants/PasswordField";
import PhoneField from "../composants/PhoneField";
import PhotoField from "../composants/PhotoField";
import StepsIndicator from "../composants/StepsIndicator";
import StudentCard from "../composants/StudentCard";
import RoadTruck from "../composants/RoadTruck";

/**
 * Register : conteneur qui ORCHESTRE les composants champs.
 * Chaque champ porte sa propre validation (ref.validate()).
 *
 * onSubmit(formData) : fonction async qui envoie les données à ton API.
 * Ex: <Register onSubmit={(fd) => api.post("/auth/register", fd)} />
 */
export default function Register({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ username: "", email: "", password: "", phone: "" });
  const [preview, setPreview] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Refs vers chaque champ (pour appeler leur validate())
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const photoRef = useRef(null);

  const cardRef = useRef(null);
  const cardNum = useMemo(() => "ET-" + Math.floor(1000 + Math.random() * 9000), []);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  /** Valide les champs de l'étape courante via leurs refs. */
  const validateStep = () => {
    const refs =
      step === 0 ? [usernameRef, emailRef, passwordRef] :
      step === 1 ? [phoneRef] :
      [photoRef];
    const results = refs.map((r) => r.current.validate());
    return results.every((e) => !e);
  };

  const boom = () => {
    const r = cardRef.current.getBoundingClientRect();
    const cols = ["#1a6ef0", "#4aa3ff", "#ffd166", "#16a34a", "#fff"];
    for (let i = 0; i < 48; i++) {
      const d = document.createElement("i");
      d.style.cssText = `position:fixed;z-index:9;width:8px;height:12px;border-radius:2px;pointer-events:none;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;background:${cols[i % 5]}`;
      document.body.appendChild(d);
      const a = Math.random() * 6.28, v = 120 + Math.random() * 220;
      d.animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v + 160}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.3,1)" }
      ).onfinish = () => d.remove();
    }
  };

  const submit = async () => {
    setLoading(true);
    setServerError("");
    try {
      const fd = new FormData();
      fd.append("username", form.username.trim());
      fd.append("email", form.email.trim());
      fd.append("password", form.password);
      if (form.phone) fd.append("phone", "+216" + form.phone);
      const photo = photoRef.current.file();
      if (photo) fd.append("photo", photo);
      if (onSubmit) await onSubmit(fd);
      setDone(true);
      boom();
    } catch (err) {
      setServerError(err?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (!validateStep()) return;
    step < 2 ? setStep(step + 1) : submit();
  };

  const onKey = (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "file") {
      e.preventDefault();
      next();
    }
  };

  const tilt = (e) => {
    const el = cardRef.current, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", x * 14 + "deg");
    el.style.setProperty("--rx", -y * 14 + "deg");
    el.style.setProperty("--sx", 50 - x * 120 + "%");
  };
  const untilt = () => ["--ry", "--rx", "--sx"].forEach((k) => cardRef.current.style.removeProperty(k));

  const tel = form.phone
    ? "+216 " + form.phone.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1 $2 $3").trim()
    : "+216 – – – – – – – –";

  return (
    <div className="reg" onKeyDown={onKey}>
      {/* ---------- GAUCHE ---------- */}
      <section className="reg-left">
        <div className="reg-logo">Edu<b>Truck</b></div>
        <h1 className="reg-big">Monte à bord,<br />l'avenir <em>roule</em> déjà.</h1>
        <p className="reg-lead">Ta carte d'étudiant se crée en direct pendant que tu t'inscris.</p>
        <div className="reg-chips">
          <span>📚 Cours</span><span>🎬 Ressources</span><span>🚀 Opportunités</span>
        </div>

        <StudentCard
          cardRef={cardRef}
          preview={preview}
          username={form.username}
          email={form.email}
          phone={tel}
          cardNum={cardNum}
          done={done}
          onTilt={tilt}
          onUntilt={untilt}
        />

        <RoadTruck />
      </section>

      {/* ---------- DROITE ---------- */}
      <section className="reg-right">
        <div className="reg-panel">
          <StepsIndicator step={step} total={3} />

          {!done && step === 0 && (
            <div className="reg-step">
              <h2 className="reg-title">Créer un compte</h2>
              <p className="reg-sub">Étape 1 sur 3 · tes identifiants</p>
              <UsernameField ref={usernameRef} value={form.username} onChange={set("username")} />
              <EmailField ref={emailRef} value={form.email} onChange={set("email")} />
              <PasswordField ref={passwordRef} value={form.password} onChange={set("password")} />
            </div>
          )}

          {!done && step === 1 && (
            <div className="reg-step">
              <h2 className="reg-title">Ton contact</h2>
              <p className="reg-sub">Étape 2 sur 3 · pour te joindre</p>
              <PhoneField ref={phoneRef} value={form.phone} onChange={set("phone")} />
            </div>
          )}

          {!done && step === 2 && (
            <div className="reg-step">
              <h2 className="reg-title">Ta photo</h2>
              <p className="reg-sub">Étape 3 sur 3 · elle apparaît sur ta carte</p>
              <PhotoField ref={photoRef} onPreview={setPreview} />
              <div className="fld-err reg-server">{serverError}</div>
            </div>
          )}

          {done && (
            <div className="reg-ok">
              <div className="reg-ok-em">🎓</div>
              <h2 className="reg-title">Bienvenue à bord !</h2>
              <p className="reg-sub">Ta carte est prête. Ton voyage commence.</p>
            </div>
          )}

          {!done && (
            <div className="reg-row">
              {step > 0 && (
                <button type="button" className="reg-btn g" onClick={() => setStep(step - 1)}>
                  Retour
                </button>
              )}
              <button type="button" className="reg-btn" onClick={next} disabled={loading}>
                {loading ? "Envoi…" : step === 2 ? "S'inscrire" : "Suivant"}
              </button>
            </div>
          )}
          <p className="reg-foot">Déjà un compte ? <a href="/login">Se connecter</a></p>
        </div>
      </section>
    </div>
  );
}