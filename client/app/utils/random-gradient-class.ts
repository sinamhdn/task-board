export function randomGradientGenerator() {
  const randomGradient = [
    "bg-gradient-to-r from-red-500/60 to-orange-500/60",
    "bg-gradient-to-r from-amber-500/60 to-yellow-700/60",
    "bg-gradient-to-r from-emerald-400/60 to-cyan-400/60",
    "bg-gradient-to-r from-blue-600/60 to-violet-600/60",
    "bg-gradient-to-r from-purple-500/60 to-purple-900/60",
  ];

  return randomGradient[Math.floor(Math.random() * randomGradient.length)];
}
