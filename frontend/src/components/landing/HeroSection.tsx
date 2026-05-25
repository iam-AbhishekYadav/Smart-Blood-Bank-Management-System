import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-blood-donation.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Blood donation scene"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="container relative z-10 py-24 md:py-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <Heart className="w-4 h-4 text-primary" fill="currentColor" />
              <span className="text-sm font-medium text-primary-foreground/90">Every drop counts</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-6"
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Save Lives.{" "}
            <span className="text-primary">Donate Blood.</span>
            <br />
            Be a Hero.
          </motion.h1>

          <motion.p
            className="text-lg text-white mb-8 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Connect with donors and recipients instantly. Our smart matching system ensures the right blood reaches the right person at the right time.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              variant="outline"
              size="lg"
              className="text-white px-8 h-12 bg-white/10 border-white/40 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-200"
              asChild
            >
              <Link to="/register/donor">
                Register as Donor
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-white px-8 h-12 bg-white/10 border-white/40 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-200"
              asChild
            >
              <Link to="/register/recipient">Register as Recipient</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-white px-8 h-12 bg-white/10 border-white/40 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-200"
              asChild
            >
              <Link to="/emergency">Emergency</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
