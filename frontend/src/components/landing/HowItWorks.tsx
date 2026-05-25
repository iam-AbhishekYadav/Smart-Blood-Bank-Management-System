import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, GitCompareArrows, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    description: "Sign up as a donor or recipient with your blood group and health details.",
  },
  {
    icon: GitCompareArrows,
    title: "Match",
    description: "Our smart algorithm finds compatible donors nearby based on blood type and distance.",
  },
  {
    icon: HeartHandshake,
    title: "Donate",
    description: "Connect with matched donors, coordinate the donation, and save a life.",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-24 bg-background" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps to make a difference in someone's life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-blood flex items-center justify-center mb-5 shadow-blood">
                <step.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
