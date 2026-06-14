import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import OrbitItem from './OrbitItem'

// Genera un path SVG que describe una elipse.
function generateEllipsePath(cx, cy, rx, ry) {
  // Sintaxis SVG Path:
  // M x y = "Move to" (posiciona el lápiz en el punto inicial)
  // A rx ry x-axis-rotation large-arc-flag sweep-flag x y = "Arc" (dibuja un arco elíptico)
  //   - rx, ry: radios en X e Y
  //   - x-axis-rotation: 0 (sin rotación del eje)
  //   - large-arc-flag: 1 (dibuja el arco mayor de 180°)
  //   - sweep-flag: 0 (dirección negativa, hacia la izquierda)
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`
  // Primer arco: desde el lado izquierdo (cx - rx) hasta el derecho (cx + rx)
  // Segundo arco: desde el lado derecho de vuelta al izquierdo (completa la elipse)
  // ¿Por qué no usar <ellipse> de SVG? Porque offset-path de CSS solo funciona con <path>
}

export default function OrbitImages({
  images = [],
  altPrefix = "Orbiting image",
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  duration = 40,
  itemSize = 64,
  direction = "normal",
  fill = true,
  width = 100,
  height = 100,
  className = "",
  showPath = false,
  pathColor = "rgba(0,0,0,0.1)",
  pathWidth = 2,
  easing = "linear",
  paused = false,
  centerContent,
  responsive = false,
  progressOverride,                                       // Permite controlar el progreso del orbita desde fuera
  radiusXOverride,                                        // Radio en X
  radiusYOverride,                                        // Radio en Y
  itemSizeOverride,                                       // Tamaño de los elementos
  rotationOverride,                                       // Rotación
  translateXOverride,                                     // Traslación en X
  focusStrength                                           // Intensidad del efecto de foco (botellas del frente más grandes)
}) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  const designCenterX = baseWidth / 2                                                       // 1. Centro X del sistema de coordenadas (400 si baseWidth=800)
  const designCenterY = baseWidth / 2                                                       // 2. Centro Y del sistema de coordenadas (400 si baseWidth=800)
  // ¿Por qué usamos baseWidth para ambos ejes? Porque el contenedor es cuadrado (aspect-ratio: 1/1)

  // Sistema de "overrides": permite que el componente funcione de dos maneras
  // 1. Modo autónomo: usa useMotionValue para crear valores internos
  // 2. Modo controlado: usa los overrides pasados desde App.jsx (controlados por scroll)
  const currentRadiusX = radiusXOverride || useMotionValue(radiusX)                         // 3. Radio en X (override o valor por defecto)
  const currentRadiusY = radiusYOverride || useMotionValue(radiusY)                         // 4. Radio en Y (override o valor por defecto)
  const currentItemSize = itemSizeOverride || useMotionValue(itemSize)                      // 5. Tamaño de los elementos (override o valor por defecto)
  const currentRotation = rotationOverride || useMotionValue(-8)                            // 6. Rotación de toda la órbita (override o -8° por defecto)
  const currentTranslateX = translateXOverride || useMotionValue(0)                         // 7. Traslación horizontal (override o 0 por defecto)
  // ¿Por qué useMotionValue y no useState? Porque useMotionValue está optimizado para animaciones
  // y se integra con useTransform para crear reacciones en cadena sin re-renders de React

  const pathValue = useTransform([currentRadiusX, currentRadiusY], ([rx, ry]) => {
    return generateEllipsePath(designCenterX, designCenterY, rx, ry)                        // 8. Genera el path SVG
    // useTransform acepta un array de MotionValues como input
    // Cada vez que rx o ry cambian (por el scroll), se recalcula el path automáticamente
    // Esto permite que la órbita cambie de forma durante la animación:
    // - Al inicio: elipse pequeña (330x140)
    // - En el medio: círculo grande (650x650)
    // - Al final: vuelve a elipse pequeña
  })

  // La órbita está diseñada para un tamaño fijo (baseWidth={800}), 
  // pero necesita funcionar en móviles, tablets y pantallas 4K.
  useEffect(() => {                                                                         // Sirve para que funcione el responsive
    if (!responsive || !containerRef.current) return                                        // Si no es responsive o no hay container, no hagas nada
    const updateScale = () => {                                                             // Función que actualiza el scale
      if (!containerRef.current) return
      setScale(containerRef.current.clientWidth / baseWidth)                                // Calcula el scale basado en el tamaño del container
      // Ejemplo: si el container mide 400px y baseWidth es 800, scale = 0.5
    }
    updateScale()                                                                           // Actualiza el scale al montar
    const observer = new ResizeObserver(updateScale)                                        // Crea un observer para detectar cambios en el tamaño del container
    observer.observe(containerRef.current)                                                  // Observa el container
    return () => observer.disconnect()                                                      // Limpia el observer al desmontar (evita memory leaks)
    // ¿Por qué no usar window.addEventListener('resize')? Porque ResizeObserver es más eficiente
    // y solo se dispara cuando el elemento específico cambia de tamaño, no toda la ventana
  }, [responsive, baseWidth])

  const internalProgress = useMotionValue(0)                                                // 9. Progress interno del orbita (0 a 100 o -100)

  useEffect(() => {                                                                         // Sirve para que funcione el orbita
    if (paused || progressOverride) return                                                  // Si hay override, no hagas nada
    const controls = animate(internalProgress, direction === "reverse" ? -100 : 100, {      // Anima el orbita
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: "loop"
    })
    return () => controls.stop()                                                            // Limpia la animación al desmontar
    // animate() devuelve un objeto con métodos .stop(), .pause(), .play()
    // Es importante limpiarlo para evitar memory leaks y animaciones fantasma
  }, [internalProgress, duration, easing, direction, paused, progressOverride])

  const activeProgress = progressOverride || internalProgress                                                                     // 10. Progress activo del orbita (override o interno)
  const containerWidth = responsive ? "100%" : typeof width === "number" ? width : "100%"                                         // 11. Ancho del container
  const containerHeight = responsive ? "auto" : typeof height === "number" ? height : typeof width === "number" ? width : "auto"  // 12. Alto del container

  const items = images.map((entry, index) => {                                              // 13. Mapea los elementos del orbita
    const src = typeof entry === "string" ? entry : entry.src                               // Obtiene la URL de la imagen
    // Flexibilidad en el input: acepta strings o objetos
    // - Array de strings: ["url1.jpg", "url2.jpg"]
    // - Array de objetos: [{ src: "url1.jpg", title: "Título", desc: "Descripción" }]
    return (
      <motion.img
        key={src}
        src={src}
        alt={`${altPrefix} ${index + 1}`}
        draggable={false}
        className="orbit-image"
        whileHover={{ scale: 1.2 }}                                                         // Al pasar el ratón, la imagen crece un 20%
        transition={{ duration: 0.3 }}                                                      // Animación suave de 0.3s
        style={{ cursor: "pointer", pointerEvents: "auto" }}                                // Permite hacer clic a pesar de estar dentro de un container con pointer-events: none
      />
    )
  })

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? "1 / 1" : undefined                                       // Mantiene el contenedor cuadrado en modo responsive
      }}
      aria-hidden="true"                                                                    // Accesibilidad: indica que este elemento es decorativo
    // Los lectores de pantalla lo ignorarán, ya que las imágenes ya tienen su propio alt
    >
      <div
        className={responsive ? "orbit-scaling-container orbit-scaling-container--responsive" : "orbit-scaling-container"}
        style={{
          width: responsive ? baseWidth : "100%",                                           // En modo responsive, siempre mide baseWidth (800px)
          height: responsive ? baseWidth : "100%",                                          // En modo responsive, siempre mide baseWidth (800px)
          transform: responsive ? `translate(-50%, -50%) scale(${scale})` : undefined       // Truco clave del responsive scaling
          // El truco:
          // 1. El contenedor interno siempre mide 800x800px (el baseWidth)
          // 2. Se posiciona en el centro con translate(-50%, -50%)
          // 3. Se escala con scale(${scale}) para ajustarse al contenedor real
          // ¿Por qué no usar vw o % directamente en los radios?
          // Porque los cálculos matemáticos de la órbita están diseñados para un sistema de coordenadas fijo de 800x800
          // Escalar el contenedor completo es más simple y preciso que recalcular todo en cada resize
        }}
      >
        <motion.div
          className="orbit-rotation-wrapper"
          style={{ rotate: currentRotation, x: currentTranslateX }}                         // Aplica la rotación y traslación de toda la órbita
        // Esto permite que toda la órbita gire o se desplace como un todo
        // Por ejemplo, en App.jsx se rota -15° al inicio y se mueve a la izquierda 
        // cuando las botellas crecen
        >
          {showPath && (                                                                    // Renderizado condicional del path SVG (útil para debugging)
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}                                     // El viewBox coincide con el sistema de coordenadas
              className="orbit-path-svg"
            >
              <path
                d={pathValue.get()}                                                         // Obtiene el valor actual del path (string SVG)
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / scale}                                             // Divide por scale para que el grosor sea consistente
              // Si el contenedor se escala a 0.5, el strokeWidth debe ser 2 / 0.5 = 4
              // para que visualmente se vea como 2px en la pantalla real
              />
            </svg>
          )}
          {items.map((item, index) => {
            const entry = images[index]
            const title = typeof entry === "object" ? entry.title : null                    // Extrae el título si existe
            const desc = typeof entry === "object" ? entry.desc : null                      // Extrae la descripción si existe
            return (
              <OrbitItem
                key={index}
                item={item}                                                                 // El elemento React (motion.img)
                title={title}                                                               // Título que aparecerá al hacer foco
                desc={desc}                                                                 // Descripción que aparecerá al hacer foco
                index={index}                                                               // Posición del item en la órbita (0, 1, 2, 3...)
                totalItems={items.length}                                                   // Total de items (para calcular el espaciado)
                pathValue={pathValue}                                                       // El path SVG de la elipse
                itemSizeValue={currentItemSize}                                             // MotionValue del tamaño del item
                rotationValue={currentRotation}                                             // MotionValue de la rotación (para contra-rotar el item)
                progress={activeProgress}                                                   // MotionValue del progreso (0 a 100)
                fill={fill}                                                                 // Si es true, distribuye los items uniformemente en la órbita
                scaleStrength={focusStrength}                                               // Intensidad del efecto de foco (0 a 1)
                focalPoint={50}                                                             // Punto de foco en la órbita (50% = frente de la elipse)
              // Los items cerca del focalPoint serán más grandes, 
              // los lejos serán más pequeños
              />
            )
          })}
        </motion.div>
      </div>
      {/* Slot opcional para contenido en el centro de la órbita
           En App.jsx no se usa, pero el componente lo soporta (ej: un logo o texto central) 
      */}
      {centerContent && <div className="orbit-center-content">{centerContent}</div>}
    </div>
  )
}