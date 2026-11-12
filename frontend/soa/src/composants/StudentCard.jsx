import "./StudentCard.css";

/**
 * Carte étudiant "live" : se remplit pendant la saisie.
 * Props : cardRef, preview, username, email, phone, cardNum, done, onTilt, onUntilt
 */
export default function StudentCard({
  cardRef,
  preview,
  username,
  email,
  phone,
  cardNum,
  done,
  onTilt,
  onUntilt,
}) {
  return (
    <div
      ref={cardRef}
      className={"stcard" + (done ? " done" : "")}
      onMouseMove={onTilt}
      onMouseLeave={onUntilt}
    >
      <div className="stcard-shine" />
      <div className="stcard-top">
        <span>EduTruck · Étudiant</span>
        <div className="stcard-chip" />
      </div>
      <div className="stcard-main">
        <div
          className="stcard-photo"
          style={preview ? { backgroundImage: `url(${preview})` } : undefined}
        >
          {!preview && (username.trim()[0]?.toUpperCase() || "?")}
        </div>
        <div className="stcard-info">
          <div className="stcard-name">{username.trim() || "Ton nom"}</div>
          <div className="stcard-line">{email.trim() || "ton@email.com"}</div>
          <div className="stcard-line">{phone}</div>
        </div>
      </div>
      <div className="stcard-stamp">ADMIS</div>
      <div className="stcard-bars" />
      <div className="stcard-foot">
        <span>N° {cardNum}</span>
        <span>Valide 2026–2027</span>
      </div>
    </div>
  );
}