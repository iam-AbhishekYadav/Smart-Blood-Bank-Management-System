import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;

const canDonateTo: Record<string, string[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

const CompatibilityChart = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-24 bg-muted" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Blood Compatibility Chart
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            See which blood types are compatible for donation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto overflow-x-auto rounded-2xl bg-card shadow-card"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Donor ↓ / Recipient →
                </th>
                {bloodTypes.map((bt) => (
                  <th key={bt} className="p-3 text-center font-bold text-foreground">{bt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloodTypes.map((donor) => (
                <tr key={donor} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-bold text-foreground">{donor}</td>
                  {bloodTypes.map((recipient) => {
                    const compatible = canDonateTo[donor]?.includes(recipient);
                    return (
                      <td key={recipient} className="p-3 text-center">
                        {compatible ? (
                          <span className="inline-flex w-7 h-7 rounded-full bg-success/10 text-success items-center justify-center text-xs font-bold">✓</span>
                        ) : (
                          <span className="inline-flex w-7 h-7 rounded-full bg-muted text-muted-foreground/40 items-center justify-center text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default CompatibilityChart;
