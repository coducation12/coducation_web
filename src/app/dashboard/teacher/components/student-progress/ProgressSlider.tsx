'use client';

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface ProgressSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function ProgressSlider({ value, onChange, className }: ProgressSliderProps) {
    return (
        <div className={cn("flex items-center gap-4 w-full", className)}>
            <SliderPrimitive.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[value]}
                max={100}
                step={5}
                onValueChange={(vals) => onChange(vals[0])}
            >
                <SliderPrimitive.Track className="bg-cyan-950/50 relative grow rounded-full h-2 border border-cyan-500/20">
                    <SliderPrimitive.Range className="absolute bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full h-full" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    className="block w-5 h-5 bg-white border-2 border-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
                    aria-label="Progress"
                />
            </SliderPrimitive.Root>
            <span className="text-sm font-black text-cyan-400 min-w-[32px]">{value}%</span>
        </div>
    );
}
