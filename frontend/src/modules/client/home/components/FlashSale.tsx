"use client"

import { useState, useEffect } from "react";
import ProductFlashSale from "./ProductFlashSale";
import { FaBolt } from "react-icons/fa";

const FlashSale = () => {
  // Countdown timer logic (example: 10h 43m 14s)
  const [timeLeft, setTimeLeft] = useState({ hours: 10, minutes: 43, seconds: 14 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-white rounded-xl shadow-lg py-6 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Header left: Icon + Title + Timer */}
        <div className="flex items-center gap-4">
          <span className="text-white text-2xl font-extrabold flex items-center animate-pulse" aria-label="Flash Sale">
            <FaBolt className="mr-2 text-yellow-300 drop-shadow-lg animate-bounce" />
            <span className="from-orange-500 to-red-500 text-red-500">FLASH SALE</span>
          </span>

        </div>
        {/* Header right: CTA Button */}
        <div className="flex items-center ml-6 rounded-lg px-4 py-2">
          <span className="flex gap-1 text-base font-mono text-white">
            <span className="bg-black rounded px-2" aria-label="Hours">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-black rounded px-2" aria-label="Minutes">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-black rounded px-2" aria-label="Seconds">{String(timeLeft.seconds).padStart(2, "0")}</span>
          </span>
        </div>
      </div>
      {/* Product grid container */}
      <div className="mt-6">
        <ProductFlashSale />
      </div>
    </section>
  );
};

export default FlashSale;
