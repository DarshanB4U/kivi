import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t  flex bg-background py-8 px-6 mt-auto">
      <div className="max-w-6xl  mx-auto flex  md:flex-row items-center justify-between gap-6">
        <div className="flex  items-center gap-2 font-bold group cursor-pointer">
          <div className="group-hover:scale-110 transition-transform duration-300">
            <img
              src="/kiwi-svgrepo-com.svg"
              alt="Kivi Logo"
              className="w-6 h-6"
            />
          </div>
          <span className="text-lg tracking-tighter">Kivi</span>
        </div>

        {/* Creator Info */}
        <div className="flex flex-col items-center md:items-start text-sm text-muted-foreground">
          Built with 🧡 by{" "}
          <span className="font-semibold text-foreground">Darshan Bondre</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/DarshanB4U"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
            aria-label="GitHub Profile"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/darshan-bondre-80601220a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
            aria-label="LinkedIn Profile"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
