import { motion } from 'framer-motion'

function Column({ heading, items }) {
  return (
    <div>
      <div className="mb-5 text-black/55" style={{
        fontFamily: "Manrope, ui-sans-serif, sans-serif",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.3em",
        textTransform: "uppercase"
      }}>
        {heading}
      </div>
      <ul className="space-y-3">
        {items.map((label) => (
          <li key={label}>
            <a href="#" className="hover:underline" style={{
              fontFamily: "Manrope, ui-sans-serif, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "rgba(0,0,0,0.85)"
            }}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const blurUp = {
    initial: { opacity: 0, y: 40, filter: "blur(20px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1, ease: "easeOut" }
  }

  return (
    <footer className="relative w-full text-black overflow-hidden" style={{ backgroundColor: "#f4ecdc" }}>
      <div className="relative max-w-[1480px] mx-auto px-8 md:px-16 pt-12 md:pt-14 pb-12">
        <motion.div
          {...blurUp}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-10 mb-20 md:mb-24"
        >
          <Column heading="Discover" items={["All fragrances", "The bottle", "Sustainability", "Editions"]} />
          <Column heading="Studio" items={["Our story", "Perfumers", "Atelier visits", "Press"]} />
          <Column heading="Contact" items={["Boutiques", "Concierge", "Returns", "Care guide"]} />

          <div>
            <div className="mb-5 text-black/55" style={{
              fontFamily: "Manrope, ui-sans-serif, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase"
            }}>
              Newsletter
            </div>
            <p className="mb-5 text-black/65" style={{
              fontFamily: "Manrope, ui-sans-serif, sans-serif",
              fontSize: "14px",
              lineHeight: 1.5
            }}>
              Editions and invitations, sent twice a season.
            </p>
            <form
              className="flex items-center border-b border-black/30 pb-2 gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-transparent flex-1 outline-none"
                style={{ fontFamily: "Manrope, ui-sans-serif, sans-serif", fontSize: "14px", color: "#000" }}
              />
              <button type="submit" style={{
                fontFamily: "Manrope, ui-sans-serif, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.25em",
                textTransform: "uppercase"
              }}>
                Subscribe →
              </button>
            </form>
          </div>
        </motion.div>

        <motion.div
          {...blurUp}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-black/15"
        >
          <div className="text-black/55" style={{
            fontFamily: "Manrope, ui-sans-serif, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase"
          }}>
            © 2026 Beyond The Collection
          </div>
          <div className="flex items-center gap-5" style={{
            fontFamily: "Manrope, ui-sans-serif, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.28em",
            textTransform: "uppercase"
          }}>
            <a href="#" className="hover:underline">Instagram</a>
            <span className="text-black/30">·</span>
            <a href="#" className="hover:underline">TikTok</a>
            <span className="text-black/30">·</span>
            <a href="#" className="hover:underline">Spotify</a>
          </div>
          <div className="text-black/55" style={{
            fontFamily: "Manrope, ui-sans-serif, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase"
          }}>
            EN · USD
          </div>
        </motion.div>
      </div>
    </footer>
  )
}