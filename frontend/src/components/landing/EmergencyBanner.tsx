import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmergencyBanner = () => {
  return (
    <section className="py-16 bg-gradient-blood relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-primary-dark/20"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="container relative z-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-primary-foreground animate-pulse-blood" />
          <span className="text-sm font-bold text-primary-foreground uppercase tracking-wider">
            Emergency Blood Request
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground mb-4">
          Someone Needs Blood Right Now
        </h2>
        <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
          Submit an emergency request — even without an account. We'll alert nearby donors immediately.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="bg-white border-white/40 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-200"
          asChild
        >
          <Link to="/emergency">
            Submit Emergency Request
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default EmergencyBanner;
