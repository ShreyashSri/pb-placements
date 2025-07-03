"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AnimatedGradientBackground() {
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Each blob has a unique path (start, mid, end positions), more balanced left/right
    const keyframes = [
      [ // Blob 1 (left)
        { left: "8%", top: "18%" },
        { left: "18%", top: "40%" },
        { left: "10%", top: "78%" }, // Lower left
      ],
      [ // Blob 2 (center-left)
        { left: "32%", top: "22%" },
        { left: "22%", top: "55%" },
        { left: "28%", top: "85%" }, // Lower left-center
      ],
      [ // Blob 3 (center-right, yellow, less prominent)
        { left: "60%", top: "25%" },
        { left: "70%", top: "50%" },
        { left: "45%", top: "80%" }, // Move yellow more to center, not right
      ],
      [ // Blob 4 (right)
        { left: "78%", top: "20%" },
        { left: "60%", top: "60%" },
        { left: "82%", top: "78%" },
      ],
    ];

    blobsRef.current.forEach((blob, i) => {
      if (!blob) return;
      // Set initial position
      gsap.set(blob, keyframes[i][0]);
      // Animate through keyframes on scroll (single tween with keyframes)
      gsap.to(blob, {
        keyframes: [
          { left: keyframes[i][1].left, top: keyframes[i][1].top, ease: "power1.inOut" },
          { left: keyframes[i][2].left, top: keyframes[i][2].top, ease: "power1.inOut" },
        ],
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      // Animate scale and movement for organic effect
      gsap.to(blob, {
        scale: () => gsap.utils.random(0.9, i === 2 ? 1.05 : 1.2), // yellow blob smaller
        rotate: () => gsap.utils.random(-10, 10),
        duration: gsap.utils.random(6, 12),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 1.5,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        ref={el => (blobsRef.current[0] = el)}
        className="gradient-blob bg-green-400"
      />
      <div
        ref={el => (blobsRef.current[1] = el)}
        className="gradient-blob bg-green-600"
      />
      <div
        ref={el => (blobsRef.current[2] = el)}
        className="gradient-blob bg-green-300"
        style={{ opacity: 0.35 }} // less prominent
      />
      <div
        ref={el => (blobsRef.current[3] = el)}
        className="gradient-blob bg-green-700"
      />
    </div>
  );
} 