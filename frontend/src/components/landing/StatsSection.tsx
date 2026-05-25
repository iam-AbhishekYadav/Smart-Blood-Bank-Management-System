import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Heart, Building2, Award } from "lucide-react";

const stats = [
  { icon: Users, label: "Registered Donors", value: 12847, suffix: "+" },
  { icon: Heart, label: "Donations Made", value: 34219, suffix: "+" },
  { icon: Building2, label: "Hospitals Connected", value: 156, suffix: "" },
  { icon: Award, label: "Lives Saved", value: 28463, suffix: "+" },
];

function useCountUp(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return count;
}

const StatCard = ({ icon: Icon, label, value, suffix, index }: {
  icon: typeof Users; label: string; value: number; suffix: string; index: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const count = useCountUp(value, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center p-8"
    >
      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1 font-medium">{label}</p>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
