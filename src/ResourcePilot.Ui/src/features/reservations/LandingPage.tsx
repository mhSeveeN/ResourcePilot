import { motion } from 'framer-motion'
import {
  MapPin, Phone, Mail, Clock, ChevronRight,
  Star, Utensils, Wine, Leaf,
} from 'lucide-react'
import { itemFadeIn, pageTransition } from '../../app/core/motion'
import {
  RESTAURANT_NAME, RESTAURANT_TAGLINE, RESTAURANT_ADDRESS,
  RESTAURANT_PHONE, RESTAURANT_EMAIL, RESTAURANT_HOURS,
  menuHighlights, experiences,
} from '../../app/core/constants'
import { Button } from '../../shared/ui/Button'

export function LandingPage({ onBookTable }: { onBookTable: () => void }) {
  return (
    <motion.div {...pageTransition} className="w-full overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(197,160,89,0.13),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_110%,rgba(197,160,89,0.07),transparent)]" />
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(197,160,89,1) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl"
        >
          <p className="mb-6 text-xs tracking-[0.35em] text-[#C5A059]">
            ✦ &nbsp; WARSAW · EST. 2018 &nbsp; ✦
          </p>
          <h1
            className="font-['Playfair_Display'] text-6xl font-normal leading-[1.15] tracking-wide text-[#F8F4EC] md:text-8xl lg:text-[7rem]"
          >
            {RESTAURANT_NAME}
          </h1>
          <div className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />
          <p className="font-['Cormorant_Garamond'] text-xl font-light italic text-[#F8F4EC]/70 md:text-2xl">
            {RESTAURANT_TAGLINE}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={onBookTable}>
              Reserve a Table
              <ChevronRight size={16} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Menu
            </Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <div className="h-8 w-px bg-gradient-to-b from-[#C5A059]/60 to-transparent" />
            <p className="text-[10px] tracking-[0.3em] text-[#C5A059]/50">SCROLL</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div {...itemFadeIn}>
            <p className="text-xs tracking-[0.3em] text-[#C5A059]">OUR STORY</p>
            <h2 className="mt-4 font-['Playfair_Display'] text-4xl leading-[1.3] md:text-5xl">
              Where Italian tradition meets modern artistry
            </h2>
            <div className="my-6 h-px w-12 bg-gradient-to-r from-[#C5A059] to-transparent" />
            <p className="font-['Cormorant_Garamond'] text-lg leading-relaxed text-[#F8F4EC]/65">
              La Tavola was born from a simple conviction: that the finest Italian cooking is not about complexity,
              but about the purity of exceptional ingredients, prepared with patience and served with warmth.
            </p>
            <p className="mt-4 font-['Cormorant_Garamond'] text-lg leading-relaxed text-[#F8F4EC]/65">
              Our head chef, trained in Bologna and Modena, brings the soul of the Italian table to Warsaw —
              with seasonal menus that change with the harvest and a wine cellar curated over seven years.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { icon: Star, label: 'Michelin Recommended' },
                { icon: Leaf, label: 'Seasonal Ingredients' },
                { icon: Wine, label: '800+ Wine Labels' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-[#F8F4EC]/60">
                  <Icon size={14} className="text-[#C5A059]" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Restaurant photo */}
          <motion.div {...itemFadeIn} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#C5A059]/15 bg-black/30">
              <img
                src={new URL('../../assets/pizza.webp', import.meta.url).toString()}
                alt="Signature pizza"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-[#C5A059]/10" />
            </div>
            {/* Floating accent card */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 rounded-2xl border border-[#C5A059]/20 bg-[#080706]/90 p-4 backdrop-blur-md sm:-bottom-6 sm:-left-6 sm:right-auto sm:block sm:p-5">
              <p className="shrink-0 font-['Playfair_Display'] text-3xl text-[#C5A059]">8+</p>
              <p className="text-right text-[11px] tracking-[0.12em] text-[#F8F4EC]/55 sm:mt-1 sm:text-left sm:text-xs sm:tracking-[0.15em]">
                YEARS OF EXCELLENCE
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EXPERIENCES ──────────────────────────────────────────────────── */}
      <section className="border-y border-[#C5A059]/10 bg-[rgba(197,160,89,0.03)] py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...itemFadeIn} className="mb-14 text-center">
            <p className="text-xs tracking-[0.3em] text-[#C5A059]">CURATED EXPERIENCES</p>
            <h2 className="mt-4 font-['Playfair_Display'] text-4xl md:text-5xl">
              Dining beyond the ordinary
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group rounded-2xl border border-white/8 bg-[rgba(248,244,236,0.04)] p-7 transition-colors hover:border-[#C5A059]/30 hover:bg-[rgba(197,160,89,0.06)]"
              >
                <p className="mb-4 text-2xl text-[#C5A059]">{exp.icon}</p>
                <h3 className="font-['Playfair_Display'] text-xl">{exp.title}</h3>
                <div className="my-4 h-px w-8 bg-gradient-to-r from-[#C5A059]/60 to-transparent" />
                <p className="text-sm leading-relaxed text-[#F8F4EC]/60">{exp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU ─────────────────────────────────────────────────────────── */}
      <section id="menu" className="mx-auto max-w-6xl px-4 py-24">
        <motion.div {...itemFadeIn} className="mb-14 text-center">
          <p className="text-xs tracking-[0.3em] text-[#C5A059]">À LA CARTE</p>
          <h2 className="mt-4 font-['Playfair_Display'] text-4xl md:text-5xl">
            Seasonal menu highlights
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-['Cormorant_Garamond'] text-lg text-[#F8F4EC]/55">
            Our menu changes with the seasons. What follows is a selection from our current offering.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {menuHighlights.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: si * 0.1 }}
            >
              <p className="mb-5 text-xs tracking-[0.3em] text-[#C5A059]">{section.category.toUpperCase()}</p>
              <div className="space-y-5">
                {section.items.map((item) => (
                  <div key={item.name} className="border-b border-white/6 pb-5 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-['Playfair_Display'] text-base leading-snug">{item.name}</p>
                      <p className="shrink-0 text-sm text-[#C5A059]">{item.price}</p>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#F8F4EC]/50">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── RESERVATION CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(197,160,89,0.1),transparent)]" />
        <motion.div {...itemFadeIn} className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <p className="text-xs tracking-[0.3em] text-[#C5A059]">JOIN US</p>
          <h2 className="mt-4 font-['Playfair_Display'] text-4xl leading-[1.3] md:text-5xl">
            Reserve your table at La Tavola
          </h2>
          <p className="mx-auto mt-5 max-w-md font-['Cormorant_Garamond'] text-lg text-[#F8F4EC]/60">
            No account required. Simply choose your date, select your table, and we will take care of the rest.
          </p>
          <div className="mt-10">
            <Button size="lg" onClick={onBookTable}>
              Make a Reservation
              <ChevronRight size={16} />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── CONTACT / FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#C5A059]/12 bg-[rgba(197,160,89,0.02)] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-['Playfair_Display'] text-2xl text-[#C5A059]">{RESTAURANT_NAME}</p>
              <p className="mt-2 text-xs tracking-[0.2em] text-[#F8F4EC]/40">FINE ITALIAN DINING</p>
              <p className="mt-4 text-sm leading-relaxed text-[#F8F4EC]/50">
                An intimate restaurant celebrating the art of Italian cuisine in the heart of Warsaw.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs tracking-[0.25em] text-[#C5A059]">FIND US</p>
              {[
                { icon: MapPin, text: RESTAURANT_ADDRESS },
                { icon: Phone, text: RESTAURANT_PHONE },
                { icon: Mail, text: RESTAURANT_EMAIL },
                { icon: Clock, text: RESTAURANT_HOURS },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-[#F8F4EC]/55">
                  <Icon size={14} className="mt-0.5 shrink-0 text-[#C5A059]/70" />
                  {text}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs tracking-[0.25em] text-[#C5A059]">RESERVATIONS</p>
              <p className="text-sm text-[#F8F4EC]/55">
                We accept reservations up to 30 days in advance. For parties larger than 8, please contact us directly.
              </p>
              <Button variant="outline" size="sm" onClick={onBookTable}>
                Book Online
              </Button>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 text-xs text-[#F8F4EC]/30 md:flex-row">
            <p>© {new Date().getFullYear()} {RESTAURANT_NAME}. All rights reserved.</p>
            <p className="tracking-[0.15em]">WARSAW · POLAND</p>
          </div>
        </div>
      </footer>

    </motion.div>
  )
}
