import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya M.",
    role: "Regular Donor",
    text: "I've donated 8 times through BloodBank. The matching system connected me to someone in critical need within minutes. Knowing I helped save a life is indescribable.",
    initials: "PM",
  },
  {
    name: "Dr. Arun K.",
    role: "City General Hospital",
    text: "BloodBank has transformed our emergency response. We can locate compatible donors in real-time, cutting our procurement time by 60%.",
    initials: "AK",
  },
  {
    name: "Meera S.",
    role: "Blood Recipient",
    text: "When my daughter needed an urgent transfusion, BloodBank found three donors within 5km in under 10 minutes. This platform literally saved her life.",
    initials: "MS",
  },
];

const TestimonialsSection = () => {
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
            Impact Stories
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real stories from donors, recipients, and medical professionals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-blood flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
