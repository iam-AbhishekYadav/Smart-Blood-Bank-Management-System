import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container pt-28 pb-24 flex-1">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">About Smart Blood Bank</h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          Smart Blood Bank connects donors, recipients, and hospitals in real-time. Our goal is to reduce
          emergency response time through intelligent matching, transparent tracking, and secure data handling.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="font-bold text-foreground mb-2">Fast Matching</h3>
            <p className="text-sm text-muted-foreground">Location-aware donor matching with blood compatibility logic.</p>
          </div>
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="font-bold text-foreground mb-2">Trusted Records</h3>
            <p className="text-sm text-muted-foreground">Secure profiles, donation history, and request tracking for transparency.</p>
          </div>
          <div className="p-5 rounded-2xl bg-card shadow-card">
            <h3 className="font-bold text-foreground mb-2">Emergency Ready</h3>
            <p className="text-sm text-muted-foreground">Admin broadcast and instant alerts to mobilize nearby eligible donors.</p>
          </div>
        </div>

        <section className="mt-12">
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="p-6 rounded-2xl bg-card shadow-card">
              <h2 className="text-xl font-bold text-foreground">How Smart Blood Bank Helps</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>
                  Emergency or donation requests are created with relevant details (blood group, timing, and
                  location).
                </li>
                <li>
                  The system identifies eligible donors nearby using blood compatibility logic and real-time
                  availability.
                </li>
                <li>
                  Donors and hospitals stay aligned with clear status updates and donation/request history.
                </li>
                <li>
                  Admins can trigger broadcasts and alerts when time is critical, helping mobilize donors quickly.
                </li>
              </ol>
            </div>

            <div className="p-6 rounded-2xl bg-card shadow-card">
              <h2 className="text-xl font-bold text-foreground">Security and Privacy by Design</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Blood donations involve sensitive personal information. Smart Blood Bank is built to keep donor
                and recipient details protected while still enabling transparency where it matters (request tracking,
                eligibility, and donation history).
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium">Encrypted profiles</span>
                <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium">Audit-friendly history</span>
                <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium">Role-based access</span>
                <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground text-xs font-medium">Controlled emergency alerts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold text-foreground mb-4">What Makes It “Smart”</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <h3 className="font-bold text-foreground mb-2">Real-time Availability</h3>
              <p className="text-sm text-muted-foreground">Get a clearer view of who can donate right now and how close they are.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <h3 className="font-bold text-foreground mb-2">Compatibility-Aware Matching</h3>
              <p className="text-sm text-muted-foreground">Match requests to donors based on blood compatibility rules to reduce mistakes.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <h3 className="font-bold text-foreground mb-2">Clear Request Tracking</h3>
              <p className="text-sm text-muted-foreground">Follow each request’s progress and maintain a trustworthy donation record.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <h3 className="font-bold text-foreground mb-2">Faster Coordination</h3>
              <p className="text-sm text-muted-foreground">Reduce back-and-forth communication by sending the right alert to the right people.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <h3 className="font-bold text-foreground mb-2">Transparent Eligibility</h3>
              <p className="text-sm text-muted-foreground">Help users understand why a donor is selected and what qualifies them.</p>
            </div>
            <div className="p-5 rounded-2xl bg-card shadow-card">
              <h3 className="font-bold text-foreground mb-2">Community Impact</h3>
              <p className="text-sm text-muted-foreground">Enable donors to contribute more efficiently and improve outcomes for recipients.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 p-6 rounded-2xl bg-card shadow-card">
          <h2 className="text-xl font-bold text-foreground">Emergency Response, Made Practical</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            When every minute matters, Smart Blood Bank helps admins and hospitals act quickly. It supports targeted
            broadcasts, instant donor alerts, and streamlined tracking so critical transfusion needs are handled with
            greater speed and confidence.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
