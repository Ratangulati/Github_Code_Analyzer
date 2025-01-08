import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Star } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-white shadow-lg rounded-full px-4 py-2 min-w-96 sm:w-auto z-50">
      <div className="flex justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center text-lg font-semibold text-black">
          <span className="bg-black text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-[12px]">
            {'</>'}
          </span>
          CodePilot
        </Link>

        {/* Call to Action */}
        <Link to="https://github.com/Ratangulati/Github_Code_Analyzer" target="_blank" >
          <Button variant="default" className="bg-white text-black border-2 border-black rounded-full px-4 py-1.5 text-sm font-medium hover:bg-black hover:text-white hover:border-white transition duration-300 ease-in-out">
            <Star />Star me
          </Button>
        </Link>
      </div>
    </nav>
  );
}  