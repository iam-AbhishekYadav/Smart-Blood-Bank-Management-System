import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, UserPlus, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const roles = [
  {
    id: "donor",
    icon: UserPlus,
    title: "Register as Donor",
    description: "Help save lives by donating blood. We'll match you with recipients who need your blood type.",
    href: "/register/donor",
  },
  {
    id: "recipient",
    icon: Building2,
    title: "Register as Recipient",
    description: "Find compatible donors near you. Submit blood requests and track them in real-time.",
    href: "/register/recipient",
  },
  {
    id: "admin",
    icon: ShieldCheck,
    title: "Admin Access",
    description: "Manage blood inventory, users, and emergency broadcasts. Restricted access.",
    href: "/login",
  },
];

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-muted">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-blood flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">BloodBank</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Join BloodBank</h1>
          <p className="text-sm text-muted-foreground">Select how you'd like to use the platform.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {roles.filter(r => r.id !== "admin").map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={role.href}
                className="block p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-gradient-blood group-hover:shadow-blood transition-all duration-300">
                  <role.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-center text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
