//app/components/Hero/Hero.tsx
"use client";

export default function Hero() {
  return (
    <section className="w-full min-h-[80vh] flex flex-col items-center justify-center text-center px-6">

      {/* MAIN NAME */}
      <h1
        className="
          text-4xl sm:text-6xl font-extrabold tracking-tight
          bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]
          text-transparent bg-clip-text
          drop-shadow-[0_0_18px_rgba(59,130,246,0.65)]
          animate-glow
        "
      >
        Hi! I am Dhruv Krishna
      </h1>

      {/* SUBTITLE */}
      <p className="mt-4 text-lg sm:text-xl font-medium text-gray-300">
        Developer • Business Analyst • Builder
      </p>

      {/* EXPLORE BUTTON */}
      <button
          onClick={() => {
            const about = document.getElementById("about");
            if (about) about.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="
            mt-10 px-8 py-3 rounded-full font-semibold text-black
            bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]
            shadow-lg shadow-blue-500/30
            hover:shadow-blue-500/60
            hover:scale-105 active:scale-95
            transition-all duration-300
          "
        >
          Explore ↓
    </button>


    </section>
  );
}
