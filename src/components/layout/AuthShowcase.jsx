import logoIcon from "../../assets/logo-icon.png";

const HEX_POSITIONS = [
  { top: "8%", left: "12%", size: 60, delay: 0 },
  { top: "22%", left: "68%", size: 90, delay: 0.5 },
  { top: "48%", left: "8%", size: 44, delay: 1 },
  { top: "58%", left: "78%", size: 56, delay: 0.2 },
  { top: "76%", left: "38%", size: 70, delay: 0.8 },
  { top: "12%", left: "42%", size: 34, delay: 0.4 },
];

function Hexagon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon
        points="50,3 93,26 93,74 50,97 7,74 7,26"
        stroke="white"
        strokeOpacity="0.12"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function AuthShowcase({ eyebrow, heading, sub }) {
  return (
    <div className="hidden lg:flex lg:w-[46%] relative bg-primary overflow-hidden flex-col justify-between px-12 py-10">
      {/* Hexagon field */}
      <div className="absolute inset-0 pointer-events-none">
        {HEX_POSITIONS.map((h, i) => (
          <div
            key={i}
            className="absolute"
            style={{ top: h.top, left: h.left }}
          >
            <Hexagon size={h.size} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/40 to-primary pointer-events-none" />

      <img src={logoIcon} alt="" className="relative w-10 h-10" />

      <div className="relative">
        <p className="font-accent text-xs uppercase tracking-[0.2em] text-accent mb-4">
          {eyebrow}
        </p>
        <h2 className="font-headline text-3xl font-bold text-white leading-tight max-w-md">
          {heading}
        </h2>
        <p className="text-white/60 text-sm mt-4 max-w-sm leading-relaxed">
          {sub}
        </p>
      </div>

      <div className="relative flex items-center gap-6 text-white/40 text-xs">
        <span>Import</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>Export</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>Chemical Trading</span>
      </div>
    </div>
  );
}
