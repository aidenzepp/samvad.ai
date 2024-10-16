"use client";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import  Link from "next/link";
export default function Home() {
  const words = [
    {
      text: "Bring",
    },
    {
      text: "language",
    },
    {
      text: "processing",
    },
    {
      text: "to",
    },
    {
      text: "the",
    },
    {
      text: "next",
    },
    {
      text: "level.",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]  ">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
        Samvad.ai
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
      <Link href="/register" passHref>
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
        Join now
      </button>
      </Link>
      <Link href="/login" passHref>
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black text-sm">
        Sign in
        </button>
      </Link>
      </div>
    </div>
  );
}
