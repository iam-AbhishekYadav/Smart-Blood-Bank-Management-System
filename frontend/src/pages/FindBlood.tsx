import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { apiRequest } from "@/services/api";
import { Droplets, ShieldCheck, Clock, MapPin, Search } from "lucide-react";

type Item = { bloodGroup: string; unitsAvailable: number };

const FindBlood = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    apiRequest<{ items: Item[] }>("/api/public/inventory-summary")
      .then((res) => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container pt-28 pb-24 flex-1">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Find Blood Availability</h1>
        <p className="text-muted-foreground mb-6">
          Live blood unit summary from the current inventory.
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          Select a blood group to see how many units are available right now, so hospitals can move faster during urgent needs.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-foreground mb-4">Find Blood Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Real-Time Inventory</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Displays a live summary of available units so you can act immediately.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Quick Blood Group Lookup</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Helps you scan blood groups at a glance and find the closest match faster.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Location-Aware Matching</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Works with neighborhood availability so eligible donors can be prioritized.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Emergency-Friendly Updates</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Keeps your request workflow moving during critical transfusion situations.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Secure & Trustworthy Records</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Maintains secure donor and donation history to improve transparency and reduce errors.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.bloodGroup} className="p-5 rounded-2xl bg-card shadow-card">
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="text-2xl font-extrabold text-primary">{item.bloodGroup}</p>
              <p className="text-sm mt-2 text-foreground">{item.unitsAvailable} units available</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindBlood;
