"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <section className="py-20 md:py-28 lg:py-36">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Find <span className="text-green-500">Student Developers</span> for Your Next Project
            </h1>
            <p className="max-w-[42rem] text-lg md:text-xl text-muted-foreground mx-auto">
              Point Blank is a community of talented student developers. Search our directory to discover skilled developers for your team.
            </p>
          </motion.div>
          
          <motion.form 
            className="flex w-full max-w-lg space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSearch}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by skill, domain, or name..."
                className="pl-10 h-12 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 px-6 rounded-full bg-green-500 hover:bg-green-600">
              Search
            </Button>
          </motion.form>
          
          <motion.div
            className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p>Popular searches:</p>
            <button 
              onClick={() => router.push("/directory?domain=Frontend+Development")}
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Frontend
            </button>
            <button 
              onClick={() => router.push("/directory?domain=Backend+Development")}
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Backend
            </button>
            <button 
              onClick={() => router.push("/directory?skills=React")}
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              React
            </button>
            <button 
              onClick={() => router.push("/directory?skills=Python")}
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Python
            </button>
            <button 
              onClick={() => router.push("/directory?skills=Machine+Learning")}
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Machine Learning
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}