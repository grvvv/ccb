import { ArrowLeft, ShoppingBag, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-primary w-full" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Large decorative 404 */}
        <div className="relative mb-6 select-none">
          <span className="text-[160px] sm:text-[220px] font-bold leading-none text-secondary tracking-tighter">
            404
          </span>
          {/* Floating bag icon centered over the middle 0 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary rounded-2xl p-4 shadow-lg">
              <ShoppingBag className="h-10 w-10 sm:h-14 sm:w-14 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Oops! Page not found
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          The page you're looking for may have been moved, deleted, or never
          existed. Let's get you back on track.
        </p>

        {/* Divider */}
        <div className="w-16 h-px bg-border mb-8" />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
          <Button asChild className="flex-1 gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2">
            <Link to="/checkout">
              <Search className="h-4 w-4" />
              Browse Shop
            </Link>
          </Button>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back
        </button>
      </div>

      {/* Footer note */}
      <div className="py-6 text-center text-xs text-muted-foreground">
        Need help?{" "}
        <Link to="/contact" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Contact support
        </Link>
      </div>
    </div>
  );
}