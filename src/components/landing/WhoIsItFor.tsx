import { motion } from "framer-motion";
import { GraduationCap, Rocket, Briefcase, TrendingUp, Home, Zap } from "lucide-react";

const personas = [
  { Icon: GraduationCap, title: "Coaches & Course Creators", body: "Sell coaching, courses, and 1:1 programs." },
  { Icon: Rocket, title: "Founders & Solopreneurs", body: "Demo your SaaS. Pitch your product." },
  { Icon: Briefcase, title: "Consultants & Agencies", body: "Showcase case studies. Win clients." },
  { Icon: TrendingUp, title: "Marketers & Affiliates", body: "Higher conversion on every video CTA." },
  { Icon: Home, title: "Real Estate & Insurance", body: "Property tours and policy explainers that close." },
  { Icon: Zap, title: "Anyone Who Sells With Video", body: "If you use video to convert, Nevorai is for you." },
];

export const WhoIsItFor = () => {
  return (
    <section className="py-20 sm:py-24 relative bg-hero-bg">
      <div className="container-app">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-4">
            Built for anyone who <span className="text-gradient-brand">sells with video.</span>
          </h2>
          <p className="text-base md:text-lg text-hero-muted">
            If you make videos to convert prospects into customers, Nevorai is for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {personas.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 hover:border-brand-emerald/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-elegant transition-all duration-300"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand mb-4 shadow-elegant">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading font-bold text-white text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-hero-muted leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
