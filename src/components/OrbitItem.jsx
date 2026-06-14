import { motion, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion'

export default function OrbitItem({
  item,
  title,
  desc,
  index,
  totalItems,
  pathValue,
  itemSizeValue,
  rotationValue,
  progress,
  fill,
  scaleStrength,
  focalPoint = 50
}) {

  // Calcula el offset (posición) de cada item en la órbita
  // Si fill es true, los items se distribuyen uniformemente en la órbita
  // Si fill es false, los items se colocan en la misma posición inicial (offset 0)
  const itemOffset = fill ? (index / totalItems) * 100 : 0                                // Calcula el espaciado inicial entre botellas. Si hay 6 botellas y fill=true, cada una está separada por 100/6 = 16.67% de la órbita.                     

  const offsetPercentage = useTransform(progress, (p) => {                                // Calcula el porcentaje del offset 
    return ((p + itemOffset) % 100 + 100) % 100                                           // Si progress aumenta, el offset percentage también aumenta, haciendo que el item se mueva a lo largo de la órbita. 
  })                                                                                      // El operador % asegura que el valor siempre esté entre 0 y 100 (cuando una botella completa la órbita, vuelve al inicio)
  // ¿Por qué el doble módulo ((x % 100) + 100) % 100?
  // Porque en JavaScript, el operador % con números negativos devuelve negativos
  // Ejemplo: -10 % 100 = -10 (no 90 como esperaríamos)
  // El doble módulo garantiza que el resultado siempre sea positivo (0-100)
  // Esto es importante cuando progress va en reversa (direction="reverse")

  const offsetDistance = useTransform(offsetPercentage, (p) => `${p}%`)                   // Calcula la distancia que debe recorrer el item en la órbita. Se convierte el porcentaje en una cadena de texto con el sufijo "%" para que offset-path lo entienda

  const itemScale = useTransform(() => {                                                    // Calcula el tamaño (escala) de cada item en la órbita
    const rawPos = offsetPercentage.get()                                                     // Obtiene el valor actual del offsetPercentage
    const strength = scaleStrength ? scaleStrength.get() : 0                                  // Obtiene el valor actual del scaleStrength
    let dist = Math.abs(rawPos - focalPoint)                                                  // Calcula la distancia entre el item y el punto focal
    if (dist > 50) dist = 100 - dist                                                          // Si la distancia es mayor a 50, se calcula la distancia desde el otro lado de la órbita
    // ¿Por qué esto? Porque la órbita es circular
    // Si el foco está en 50% y la botella en 90%, la distancia real es 40%
    // Pero si la botella está en 10%, la distancia por el otro lado es 40% (no 40% hacia adelante)
    // Esta lógica asegura que siempre calculemos la distancia más corta

    let targetScale = 1                                                                       // Valor por defecto del tamaño (escala)
    if (dist < 20) {                                                                          // Si la distancia es menor a 20, se aplica la curva de escala
      const ratio = dist / 20                                                                 // Calcula el ratio entre la distancia y 20 (0 a 1)
      const cosCurve = (Math.cos(ratio * Math.PI) + 1) / 2                                    // Calcula la curva de escala
      // ¿Por qué una curva coseno?
      // Math.cos(0 * π) = 1 → cosCurve = 1 → targetScale = 1.0 (tamaño máximo en el foco)
      // Math.cos(1 * π) = -1 → cosCurve = 0 → targetScale = 0.4 (tamaño mínimo fuera del foco)
      // La curva coseno crea una transición suave y orgánica, no lineal
      // El ojo humano percibe el movimiento de forma no lineal, así que se siente más natural
      targetScale = 0.4 + cosCurve * 0.6                                                      // Calcula el tamaño (escala) final (entre 0.4 y 1.0)
    } else {                                                                                  // Si la distancia es mayor a 20, se establece el tamaño (escala) final en 0.4
      targetScale = 0.4
    }
    return 1 - strength * (1 - targetScale)                                                   // Calcula la escala final del item
    // ¿Qué hace esta fórmula?
    // Si strength = 0: return 1 - 0 * (1 - targetScale) = 1 (todas las botellas son del mismo tamaño)
    // Si strength = 1: return 1 - 1 * (1 - targetScale) = targetScale (efecto máximo)
    // strength actúa como un "mix" entre el efecto y sin efecto
  })

  const offsetPath = useMotionTemplate`path("${pathValue}")`                                  // Crea una plantilla para el path
  // useMotionTemplate crea una plantilla reactiva: cuando pathValue cambia 
  // (la elipse se deforma por el scroll), el offsetPath se actualiza automáticamente
  // offsetPath es una propiedad CSS moderna que permite mover elementos HTML 
  // a lo largo de un path SVG
  // Es mucho más eficiente que calcular manualmente las coordenadas (x, y) 
  // de cada botella en cada frame

  const zIndexMV = useTransform(itemScale, (s) => Math.round(s * 100))                        // Calcula el zIndex basado en la escala
  // Las botellas más grandes (cerca del foco) tienen un zIndex mayor (hasta 100)
  // Las botellas más pequeñas (lejos del foco) tienen un zIndex menor (hasta 40)
  // Esto crea el efecto de profundidad 3D: las botellas del frente se renderizan 
  // delante de las de atrás

  const counterRotate = useTransform(rotationValue, (r) => `rotate(${-r}deg)`)              // Rota el item en sentido contrario a la órbita
  // ¿Por qué es necesario?
  // Cuando toda la órbita rota (por ejemplo, -15° al inicio en App.jsx), 
  // las botellas rotan con ella
  // Esto haría que las botellas se inclinaran, lo cual se ve raro
  // La contra-rotación cancela ese efecto, manteniendo las botellas siempre verticales
  // Ejemplo: órbita rota -15°, botella rota +15° → resultado: botella vertical (0° neto)

  const labelOpacity = useTransform(scaleStrength || useMotionValue(0), (s) => s)           // Calcula la opacidad de la etiqueta
  // Los labels solo aparecen cuando el efecto de foco está activo (scaleStrength > 0)
  // Si scaleStrength no existe, usa useMotionValue(0) como fallback (opacidad 0)
  // Esto evita que los labels sean distractores en el modo automático (rotación lenta)

  return (
    <motion.div
      className="orbit-item"
      style={{
        width: itemSizeValue,
        height: itemSizeValue,
        offsetPath,                                                                         // El path SVG de la elipse (calculado en OrbitImages)
        offsetRotate: "0deg",                                                               // No rotar el elemento automáticamente (usamos counterRotate manualmente)
        offsetAnchor: "center center",                                                      // El punto de anclaje es el centro del elemento
        offsetDistance,                                                                     // La distancia a lo largo del path (0% a 100%)
        scale: itemScale,                                                                   // La escala calculada (efecto de foco)
        zIndex: zIndexMV,                                                                   // El zIndex dinámico (profundidad 3D)
        pointerEvents: "auto"                                                               // Permite hacer clic a pesar de estar dentro de un container con pointer-events: none
      }}
    >
      <motion.div style={{ transform: counterRotate, width: "100%", height: "100%", position: "relative" }}>
        {/* Capa 1: Contenedor con contra-rotación */}
        {/* Este div aplica la contra-rotación para mantener la botella vertical */}
        {/* También sirve como contenedor relativo para posicionar los labels */}

        {item}
        {/* Capa 2: La imagen de la botella (recibida como prop desde OrbitImages) */}

        {(title || desc) && (
          <motion.div
            style={{
              position: "absolute",
              left: "115%",                                                                 // Posiciona el label a la derecha de la botella, con un pequeño espacio
              top: "50%",                                                                   // Centra verticalmente
              transform: "translateY(-50%)",                                                // Ajusta el centrado vertical (truco clásico de CSS)
              width: "min(360px, 95%)",                                                     // Ancho máximo de 360px, pero nunca más del 95% del contenedor padre
              color: "#000",
              opacity: labelOpacity,                                                        // Opacidad controlada por scaleStrength
              pointerEvents: "none",                                                        // El label no interfiere con los clics en la botella
              fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
            }}
          >
            {/* Capa 3: Los labels (título y descripción) */}
            {/* Solo se renderizan si existen (title o desc) */}

            {title && (
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(26px, 3vw, 40px)",                                         // Tipografía responsive: entre 26px y 40px, escalando con el viewport
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                marginBottom: "14px",
                whiteSpace: "normal"
              }}>
                {title}
              </div>
            )}
            {desc && (
              <div style={{
                fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1vw, 15px)",                                         // Tipografía responsive: entre 13px y 15px
                lineHeight: 1.5,
                color: "rgba(0,0,0,0.72)"                                                   // Negro con 72% de opacidad (más suave que el título)
              }}>
                {desc}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}