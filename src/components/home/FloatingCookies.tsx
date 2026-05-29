const COOKIES = [
  { left: "8%", top: "12%", size: 48, delay: "0s", duration: "5s" },
  { left: "85%", top: "18%", size: 40, delay: "1.2s", duration: "6s" },
  { left: "15%", top: "72%", size: 36, delay: "0.6s", duration: "5.5s" },
  { left: "78%", top: "68%", size: 52, delay: "2s", duration: "7s" },
  { left: "92%", top: "45%", size: 28, delay: "0.3s", duration: "4.5s" },
  { left: "4%", top: "42%", size: 32, delay: "1.8s", duration: "6.5s" },
];

export function FloatingCookies() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {COOKIES.map((c, i) => (
        <img
          key={i}
          src="/assets/cookie-icon.png"
          alt=""
          className="absolute opacity-[0.22] drop-shadow-[0_8px_24px_rgba(245,200,66,0.15)]"
          style={{
            left: c.left,
            top: c.top,
            width: c.size,
            height: c.size,
            animation: `float-slow ${c.duration} ease-in-out ${c.delay} infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-black/40" />
    </div>
  );
}
