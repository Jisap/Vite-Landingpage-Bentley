import { motion } from 'framer-motion'
import { STAY_SECTION_IMAGE } from '../data/assets'

export default function StaySection() {
  // Patrón de animación reutilizable: "blurUp"
  // Este objeto define cómo aparecen los elementos cuando entran en el viewport
  const blurUp = {
    initial: { opacity: 0, y: 40, filter: "blur(20px)" },                    // Estado inicial: invisible, desplazado 40px hacia abajo, muy borroso
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },                  // Estado final: visible, en su posición original, sin blur
    viewport: { once: true, amount: 0.3 },                                   // Configuración del viewport
    transition: { duration: 1, ease: "easeOut" }                             // Duración y easing de la animación
  }
  // ¿Qué significa cada propiedad?
  // - initial: el estado del elemento ANTES de que entre en el viewport
  // - whileInView: el estado del elemento MIENTRAS está visible en el viewport
  // - viewport:
  //   - once: true → la animación solo se ejecuta UNA VEZ (no se repite si sales y vuelves a entrar)
  //   - amount: 0.3 → la animación se dispara cuando el 30% del elemento es visible
  // - transition: cómo se anima la transición (1 segundo, easing suave)

  // ¿Por qué usar un patrón reutilizable?
  // Porque ambos bloques de contenido (título y formulario) usan la misma animación
  // En lugar de repetir el código, lo definimos una vez y lo aplicamos con {...blurUp}

  return (
    <section
      className="relative w-full overflow-hidden"                            // relative: para posicionar la imagen de fondo de forma absoluta
      // overflow-hidden: evita que la imagen se salga del contenedor
      style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}             // minHeight: al menos el alto de la pantalla
    // backgroundColor: fondo blanco (la imagen se superpone encima)
    >
      {/* Imagen de fondo decorativa */}
      <img
        src={STAY_SECTION_IMAGE}                                             // Importada desde src/data/assets.js
        alt=""                                                               // alt vacío porque es decorativa
        aria-hidden="true"                                                   // Accesibilidad: los lectores de pantalla la ignoran
        className="absolute inset-x-0 bottom-0 w-full pointer-events-none select-none"
        // absolute: se posiciona respecto al section (que tiene relative)
        // inset-x-0: left: 0, right: 0 (ocupa todo el ancho)
        // bottom-0: se pega a la parte inferior
        // w-full: ancho 100%
        // pointer-events-none: no interfiere con clics en el contenido encima
        // select-none: no se puede seleccionar el texto de la imagen (si lo tuviera)
        style={{ objectFit: "cover", objectPosition: "center bottom" }}
      // objectFit: "cover" → la imagen cubre todo el contenedor, recortándose si es necesario
      // objectPosition: "center bottom" → la imagen se alinea al centro-inferior
      // Esto asegura que la parte importante de la imagen (las plantas) siempre sea visible
      />

      {/* Contenido principal */}
      <div
        className="relative max-w-[1480px] mx-auto px-8 md:px-16 pt-20 md:pt-24 pb-20 md:pb-24 min-h-screen flex flex-col"
        // relative: para que el contenido esté por encima de la imagen de fondo
        // max-w-[1480px]: ancho máximo de 1480px (centrado con mx-auto)
        // mx-auto: centra horizontalmente el contenedor
        // px-8 md:px-16: padding horizontal de 32px en móvil, 64px en desktop
        // pt-20 md:pt-24: padding superior de 80px en móvil, 96px en desktop
        // pb-20 md:pb-24: padding inferior de 80px en móvil, 96px en desktop
        // min-h-screen: al menos el alto de la pantalla
        // flex flex-col: layout flex en columna (los hijos se apilan verticalmente)
        style={{ gap: "32px" }}                                              // Espacio de 32px entre los hijos (título y formulario)
      >
        {/* Bloque 1: Título grande */}
        <motion.div {...blurUp}>                                             // Aplica la animación blurUp
          <div style={{
            fontFamily: "'Instrument Serif', serif",                         // Tipografía serif elegante
            fontSize: "clamp(60px, 11vw, 160px)",                            // Tamaño responsive: entre 60px y 160px, escalando con el viewport
            // ¿Cómo funciona clamp(min, preferred, max)?
            // - min: 60px → nunca será más pequeño que 60px
            // - preferred: 11vw → preferiblemente será el 11% del ancho del viewport
            // - max: 160px → nunca será más grande que 160px
            // Esto asegura que el texto sea legible en móvil y espectacular en desktop
            lineHeight: 0.95,                                                // Interlineado muy ajustado (95% del tamaño de fuente)
            letterSpacing: "-0.01em",                                        // Espaciado entre letras ligeramente negativo (más junto)
            color: "#000"                                                    // Color negro puro
          }}>
            Stay <span style={{ fontStyle: "italic" }}>in</span>             // "in" en cursiva para dar énfasis visual
          </div>
          <div style={{
            fontFamily: "Manrope, ui-sans-serif, sans-serif",                // Tipografía sans-serif moderna
            fontWeight: 400,                                                 // Peso normal (no negrita)
            lineHeight: 0.95,                                                // Interlineado ajustado
            letterSpacing: "-0.02em",                                        // Espaciado entre letras más negativo que el título
            color: "#000",
            fontSize: "64px"                                                 // Tamaño fijo de 64px (no responsive en este caso)
          }}>
            the collection
          </div>
        </motion.div>

        {/* Bloque 2: Descripción y formulario */}
        <motion.div
          {...blurUp}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}          // Sobrescribe la transición para añadir un delay de 0.2s
          // ¿Por qué el delay?
          // Para que el formulario aparezca ligeramente después del título
          // Esto crea un efecto de "entrada en cascada" más elegante
          className="max-w-md"                                               // Ancho máximo de 28rem (448px) para que el texto no sea demasiado largo
        >
          <p className="mb-6" style={{
            fontFamily: "Manrope, ui-sans-serif, sans-serif",
            fontSize: "15px",
            lineHeight: 1.55,                                                // Interlineado más generoso para el párrafo (mejor legibilidad)
            color: "rgba(0,0,0,0.78)"                                        // Negro con 78% de opacidad (más suave que el título)
          }}>
            Editions and invitations from the Bentley fragrance studio, sent twice a season.
          </p>

          {/* Formulario de newsletter */}
          <form
            className="flex items-center border-b border-black/40 pb-2 gap-3"
            // flex items-center: los hijos se alinean horizontalmente y centrados verticalmente
            // border-b border-black/40: línea inferior negra con 40% de opacidad
            // pb-2: padding inferior de 8px (espacio entre el texto y la línea)
            // gap-3: espacio de 12px entre el input y el botón
            onSubmit={(e) => e.preventDefault()}                             // Previene el envío real del formulario (es solo demo)
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-transparent flex-1 outline-none"
              // bg-transparent: fondo transparente (se ve el fondo blanco del section)
              // flex-1: ocupa todo el espacio disponible (empuja el botón a la derecha)
              // outline-none: elimina el borde azul por defecto al hacer focus
              style={{
                fontFamily: "Manrope, ui-sans-serif, sans-serif",
                fontSize: "15px",
                color: "#000"
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: "Manrope, ui-sans-serif, sans-serif",
                fontSize: "11px",
                fontWeight: 500,                                             // Peso medio (ligeramente más grueso que el texto normal)
                letterSpacing: "0.25em",                                     // Espaciado entre letras muy generoso (efecto de mayúsculas elegantes)
                textTransform: "uppercase",                                  // Convierte el texto a mayúsculas
                color: "#000"
              }}
            >
              Subscribe →
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}