"use client";
import { FaRegLightbulb } from "react-icons/fa";

const steps = [
  {
    title: "Upload Resume",
    description:
      "Start by uploading your resume. Our system will automatically parse your skills and experience to create your profile.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#22c55e" fillOpacity="0.2" />
        <path d="M8 12h8M12 8v8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Get Discovered",
    description:
      "Once your profile is live, recruiters and project owners can discover you based on your skills, domain, and interests.",
    icon: (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'rgba(34,197,94,0.15)', borderRadius: '50%' }}>
        <FaRegLightbulb size={32} color="#22c55e" />
      </span>
    ),
  },
  {
    title: "Connect & Collaborate",
    description:
      "Receive messages, connect with teams, and collaborate on exciting projects tailored to your expertise.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#22c55e" fillOpacity="0.2" />
        <path d="M10.59 13.41a2 2 0 002.83 0l3.17-3.17a2 2 0 10-2.83-2.83l-1.06 1.06M13.41 10.59a2 2 0 00-2.83 0l-3.17 3.17a2 2 0 102.83 2.83l1.06-1.06" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 w-full">
      <div className="px-4 md:px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          How it <span className="text-green-500">Works</span>
        </h2>
        <div className="flex justify-center mb-12">
          <div className="h-px w-48 bg-white rounded-full" />
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="group rounded-2xl p-[2px] transition-all duration-300 group-hover:-translate-y-2 hover:-translate-y-2"
            >
              <div
                className="rounded-2xl bg-gradient-to-br from-black via-zinc-900 to-zinc-800 shadow-xl p-8 flex flex-col min-w-[260px] max-w-md mx-auto h-full relative"
                style={{ zIndex: 1 }}
              >
                <div className="mb-6 flex items-center justify-center">{step.icon}</div>
                <div className="text-lg font-bold text-white mb-2">{step.title}</div>
                <div className="text-sm text-zinc-200 mb-2">{step.description}</div>
              </div>
              {/* Gradient border only on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(120deg, #22c55e, #4ade80 60%, #22d3ee)',
                  zIndex: 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 