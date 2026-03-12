import Link from "next/link";
import { Github, Linkedin, Code } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background py-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Code size={18} />
          </div>
          <span>Kivi</span>
        </div>
        
        {/* Creator Info */}
        <div className="flex flex-col items-center md:items-start text-sm text-muted-foreground">
          <p className="mb-2 md:mb-0">
            Built with 💙 by <span className="font-semibold text-foreground">Darshan Bondre</span>
          </p>
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
      
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground/60 gap-4">
         <p>© {new Date().getFullYear()} Kivi Platform. All rights reserved.</p>
         <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
         </div>
      </div>
    </footer>
  );
}
