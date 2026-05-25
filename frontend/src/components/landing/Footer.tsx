import { Link } from "react-router-dom";
import { Droplets, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground/70 py-16">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-blood flex items-center justify-center">
                <Droplets className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-primary-foreground">BloodBank</span>
            </div>
            <p className="text-sm leading-relaxed">
              A smart blood bank management system connecting donors, recipients, and hospitals for life-saving blood transfusions.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary-foreground uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link to="/find-blood" className="hover:text-primary-foreground transition-colors">Find Blood</Link></li>
              <li><Link to="/emergency" className="hover:text-primary-foreground transition-colors">Emergency Request</Link></li>
              <li><Link to="/register/donor" className="hover:text-primary-foreground transition-colors">Become a Donor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary-foreground uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Blood Compatibility</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Donation FAQs</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Eligibility Guide</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary-foreground uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                +91 1800-XXX-XXXX
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                support@bloodbank.org
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                Health Ministry Complex, New Delhi
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} BloodBank. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
