import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValue,
  useAnimationFrame
} from 'framer-motion'
import OrbitImages from './components/OrbitImages'
import StaySection from './components/StaySection'
import Footer from './components/Footer'
//import { orbitImagesData, VIDEO_SRC, TARGET_RADIUS } from './data/orbitImage'
import { orbitImagesData, VIDEO_SRC, TARGET_RADIUS } from './data/assets'



export default function App() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({                                         // Framer Motion nos da el progreso del scroll como un número entre 0 (inicio) y 1 (final de los 600vh). 
    target: containerRef,                                                         // Luego, useTransform traduce ese número en valores visuales.
    offset: ["start start", "end end"]
  })

  const rx = useTransform(scrollYProgress, [0, 0.08, 1], ["0%", "55%", "55%"])      // 1. La elipse empieza siendo invisible (0% de radio). 
  const ry = useTransform(scrollYProgress, [0, 0.08, 1], ["0%", "55%", "55%"])      // 2. A medida que bajas (el progreso sube de 0 a 0.08), ese círculo crece hasta cubrir casi toda la pantalla (55%). 
  const clipPath = useMotionTemplate`ellipse(${rx} ${ry} at 50% 50%)`               // 3. Una vez que cubre todo, se queda quieto (en el 55%). 
  // Crea una máscara elíptica centrada. Al inicio es un punto (0%), 
  // se expande hasta cubrir la pantalla (55% en ambos ejes), y se queda estática.


  const textOpacity = useTransform(
    scrollYProgress,
    [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1],                                        // 1. Empieza invisible (0). 
    [0, 1, 1, 0, 0, 1, 1]                                                           // 2. Luego se vuelve visible (1). 
  )
  // Narrativa del texto central:
  // - 0.03: invisible (aún no ha empezado la revelación)
  // - 0.08: totalmente visible (el clipPath ya lo descubrió)
  // - 0.15: sigue visible (el usuario está viendo el texto)
  // - 0.22: desaparece (da paso a las botellas del orbit)
  // - 0.90: sigue invisible (las botellas están en primer plano)
  // - 0.98: reaparece (cierre de la animación, vuelta al inicio)
  // - 1.00: visible de nuevo 


  const textBlurVal = useTransform(
    scrollYProgress,                                                                // 1. Al inicio, está borroso (15px).
    [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1],                                        // 2. Se desenfoca (0) mientras el círculo crece. 
    [15, 0, 0, 15, 15, 0, 0]                                                        // 3. Se vuelve a enfocar al final de la animación del círculo. 
  )
  const filterText = useMotionTemplate`blur(${textBlurVal}px)`                      // Crea una plantilla para aplicar el efecto de desenfoque (blur) al texto. 
  const yElement = useTransform(                                                    // Usa el progreso del scroll para mover el texto verticalmente. 
    scrollYProgress,
    [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1],
    [20, 0, 0, 20, 20, 0, 0]
  )

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.03, 0.08], [1, 1, 0])                                         // 1. Muestra la flecha al inicio (1). 
  // 2. La desaparece a medida que bajas (0). 
  const orbitItemSize = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [80, 360, 360, 80, 80])                    // 1. Los puntos comienzan pequeños (80px). 
  const orbitRx = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [330, TARGET_RADIUS, TARGET_RADIUS, 330, 330])   // 2. Luego crecen hasta cubrir toda la pantalla (TARGET_RADIUS). 
  const orbitRy = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [140, TARGET_RADIUS, TARGET_RADIUS, 140, 140])   // 3. Una vez que cubren todo, se quedan quietos. 
  const orbitRotation = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [-15, 0, 0, -15, -15])                     // 4. Los puntos giran (-15 grados) al inicio.

  const orbitTx = useTransform(
    scrollYProgress,
    [0.15, 0.25, 0.85, 0.95, 1],
    [0, -(TARGET_RADIUS + 200), -(TARGET_RADIUS + 200), 0, 0]                                                                 // 5. Los puntos se mueven hacia la izquierda (separándose del centro). 
  )
  const focusStrength = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [0, 1, 1, 0, 0])                           // 6. Controla la intensidad del desenfoque o enfoque (suavizado). 

  const orbitProgress = useMotionValue(0)                                                                                     // 7. Se inicializa el valor de progreso del orbita en 0. 
  const prevScroll = useRef(0)                                                                                                // 8. Se guarda el valor anterior del progreso del scroll. 

  useAnimationFrame((time, delta) => {                                                                                        // 9. Se ejecuta en cada fotograma para actualizar el progreso del orbita. 
    const pos = scrollYProgress.get()
    const scrollDelta = pos - prevScroll.current                                                                             // 10. Se calcula la diferencia entre la posición actual y la anterior. 
    prevScroll.current = pos                                                                                                 // 11. Se actualiza el valor anterior del progreso del scroll. 

    let frameSpeed = 0
    if (pos > 0.15 && pos < 0.85) {
      frameSpeed = scrollDelta * 200                                                                                         // 12. Si el scroll está entre 0.15 y 0.85, se calcula la velocidad del frame. 
    } else {
      frameSpeed = (delta / 1000) * 2.5                                                                                      // 13. Si el scroll está fuera de ese rango, se calcula la velocidad del frame de manera diferente. 
    }

    orbitProgress.set(orbitProgress.get() + frameSpeed)                                                                      // 14. Se actualiza el valor de progreso del orbita. 
  });
  // ¿Por qué useAnimationFrame y no useTransform?
  // useTransform reacciona a la POSICIÓN del scroll (dónde está el usuario).
  // useAnimationFrame reacciona al TIEMPO (60fps) y permite acumular velocidad.
  // Esto hace que las botellas giren de forma continua aunque el usuario deje de scrollear,
  // y que giren más rápido si el usuario hace scroll velozmente.

  return (
    <>
      {/* Contenedor principal MUY alto para generar espacio de scroll */}
      <div ref={containerRef} className="relative w-full h-[600vh] bg-black">
        {/* Contenedor interno que se "pega" a la parte superior de la pantalla */}
        {/* El navegador cree que está bajando por una página de 600vh (6 veces el alto de la pantalla). 
            Pero gracias a sticky top-0, el contenido visual se queda congelado en la pantalla (h-screen) 
            mientras el scroll avanza. Framer Motion usa ese avance de scroll (de 0% a 100%) 
            como si fuera la línea de tiempo de un video. 
        */}
        <div className="sticky top-0 w-full h-screen overflow-hidden text-white">
          {/* Video de fondo */}
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {/* Logo superior izquierdo */}
          <div
            className="absolute z-10 flex flex-col items-start text-left text-black select-none leading-[0.95]"
            style={{ top: "120px", left: "96px" }}
          >
            <div className="flex items-baseline">
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 5vw, 64px)" }}>
                Beyond
              </span>
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontSize: "clamp(32px, 5vw, 64px)",
                marginLeft: "0.05em"
              }}>
                The
              </span>
            </div>
            <span style={{
              fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4.4vw, 56px)",
              letterSpacing: "-0.01em",
              marginTop: "0.05em"
            }}>
              Collection
            </span>
          </div>

          {/* Flecha de scroll */}
          <motion.div
            className="absolute z-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white select-none pointer-events-none"
            style={{ bottom: "40px", opacity: scrollHintOpacity }}
          >
            <div className="relative w-[20px] h-[34px] overflow-hidden">
              <svg
                className="scroll-arrow absolute inset-0"
                width="20" height="34" viewBox="0 0 20 34" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
              >
                <path d="M10 4 V28 M3 21 L10 28 L17 21" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>

          {/* Reveal con clip-path y orbit */}
          <motion.div
            className="absolute z-20 flex items-center justify-center overflow-hidden"
            style={{
              clipPath,
              rotate: -15,
              width: "150vw",
              height: "150vh",
              left: "-25vw",
              top: "-25vh"
            }}
          >
            <div className="absolute inset-0 bg-white" />
            <div
              className="relative flex flex-col items-center justify-center"
              style={{ width: "100vw", height: "100vh", transform: "rotate(15deg)" }}
            >
              <motion.div className="w-[90vw] max-w-[1200px] aspect-square relative z-0">
                <OrbitImages
                  images={orbitImagesData}
                  direction="normal"
                  duration={40}
                  fill={true}
                  showPath={false}
                  responsive={true}
                  baseWidth={800}
                  progressOverride={orbitProgress}
                  radiusXOverride={orbitRx}
                  radiusYOverride={orbitRy}
                  itemSizeOverride={orbitItemSize}
                  rotationOverride={orbitRotation}
                  translateXOverride={orbitTx}
                  focusStrength={focusStrength}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Overlays de texto */}
          <div className="absolute inset-0 z-[60] pointer-events-none">
            {/* Texto central */}
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              <motion.div
                className="flex flex-col items-center whitespace-nowrap pointer-events-auto"
                style={{
                  filter: filterText,
                  opacity: textOpacity,
                  WebkitFontSmoothing: "antialiased",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "translateZ(0)"
                }}
              >
                <div className="flex items-baseline text-black leading-none mb-1">
                  <span className="font-serif text-[45px] md:text-[55px] tracking-tight text-black">Beyond </span>
                  <span className="font-serif text-[45px] md:text-[55px] italic tracking-tight text-black">The</span>
                </div>
                <span className="font-sans text-[28px] md:text-[36px] tracking-tight text-black mt-[-5px]">Collection</span>
              </motion.div>
            </div>

            {/* Info superior derecha */}
            <motion.div
              className="absolute top-32 right-[calc(6vw+150px)] md:right-[214px] flex flex-col items-start text-left pointer-events-auto cursor-text"
              style={{ y: yElement, filter: filterText, opacity: textOpacity }}
            >
              <span className="font-serif text-[40px] leading-none mb-3 text-black">2K26</span>
              <span className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] text-left">
                JOIN AN EXCLUSIVE<br />COMMUNITY
              </span>
            </motion.div>

            {/* Número inferior izquierdo */}
            <motion.div
              className="absolute bottom-8 left-8 md:bottom-16 md:left-16 flex flex-col items-start text-black pointer-events-auto cursor-text"
              style={{ y: yElement, filter: filterText, opacity: textOpacity }}
            >
              <span className="font-serif text-[40px] leading-none mb-1 text-black">0651</span>
              <span className="font-serif text-[16px] uppercase tracking-widest text-black">COLLECTION</span>
            </motion.div>

            {/* CTA inferior derecho */}
            <div className="absolute bottom-16 right-[6vw] md:right-[10vw] flex flex-col items-start z-10 pointer-events-auto">
              <motion.p
                className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] mb-6 text-left w-[240px] cursor-text"
                style={{ y: yElement, filter: filterText, opacity: textOpacity }}
              >
                JOIN AN EXCLUSIVE COMMUNITY OF SAILORS. WHETHER YOU CRAVE THE THRILL OF THE OPEN
              </motion.p>
              <motion.div
                className="flex gap-0 pointer-events-auto items-center"
                style={{ y: yElement, filter: filterText, opacity: textOpacity }}
              >
                <button className="bg-black hover:bg-black/90 transition-colors text-white rounded-[40px] px-8 py-3.5 font-serif tracking-[0.1em] uppercase text-[12px] md:text-[14px] z-10">
                  BUY COLLECTION
                </button>
                <button className="bg-black hover:bg-black/90 transition-colors w-[46px] h-[46px] flex items-center justify-center rounded-[50%] text-white -ml-2 z-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Header */}
          <motion.header
            className="absolute top-0 left-0 w-full px-6 md:px-12 py-5 md:py-6 flex justify-between items-center z-[100] pointer-events-none"
            style={{ opacity: scrollHintOpacity }}
          >
            <a href="#" className="flex items-center gap-3 text-black select-none pointer-events-auto" aria-label="Bentley">
              <svg width="54" height="40" viewBox="0 0 84 60" fill="none" aria-hidden="true">
                <g fill="currentColor">
                  <path d="M42 22 C30 22 19 16 4 12 C9 26 18 33 30 33 L42 33 Z" />
                  <path d="M42 22 C54 22 65 16 80 12 C75 26 66 33 54 33 L42 33 Z" />
                  <path d="M34 25 C36 28 39 30 42 30 C45 30 48 28 50 25 L42 22 Z" opacity="0.7" />
                </g>
                <text x="42" y="52" textAnchor="middle" fontFamily="'Instrument Serif', serif" fontSize="22" fontStyle="italic" fill="currentColor">B</text>
              </svg>
              <span style={{
                fontFamily: "Manrope, ui-sans-serif, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.42em",
                textTransform: "uppercase"
              }}>
                Bentley
              </span>
            </a>

            <a
              href="#"
              className="pointer-events-auto inline-flex items-center gap-2 bg-black text-white rounded-full pl-5 pr-2 py-2 hover:bg-black/85 transition-colors"
              style={{
                fontFamily: "Manrope, ui-sans-serif, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase"
              }}
            >
              <span className="hidden sm:inline">Shop the collection</span>
              <span className="sm:hidden">Shop</span>
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-white/15">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </motion.header>
        </div>
      </div>

      <StaySection />
      <Footer />
    </>
  )
}