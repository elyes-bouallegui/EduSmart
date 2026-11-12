import "./RoadTruck.css";

/** Petit camion animé sur la route (décor de la partie gauche). */
export default function RoadTruck() {
  return (
    <div className="road">
      <div className="truckwrap">
        <svg viewBox="0 0 110 50" aria-hidden="true">
          <rect x="2" y="8" width="64" height="30" rx="4" fill="#fff" />
          <rect x="2" y="8" width="64" height="8" rx="4" fill="#1a6ef0" />
          <path d="M66 16h24l16 14v8H66z" fill="#7cc0ff" />
          <path d="M72 20h14l9 9H72z" fill="#0a3d91" />
          <circle cx="24" cy="40" r="7" fill="#04102a" stroke="#fff" strokeWidth="3" />
          <circle cx="92" cy="40" r="7" fill="#04102a" stroke="#fff" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}