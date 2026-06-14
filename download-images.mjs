import fs from 'fs/promises';
import path from 'path';

// 1. Definimos todos los assets con sus URLs originales y nombres limpios
const assetsToDownload = [
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/BL1996-Beyond_wild_vetiver_Flakon_100ml_300dpi_a55ie5-ad7edb.webp",
    filename: "bottle-wild-vetiver.webp",
    type: "image",
    title: "Wild Vetiver",
    desc: "Smoky vetiver wrapped in saffron and leather — a grounded, untamed signature."
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/BL2156_BEYOND_RADIANT_OSMANTHUS_hoc3up-259f05.webp",
    filename: "bottle-radiant-osmanthus.webp",
    type: "image",
    title: "Radiant Osmanthus",
    desc: "Apricot-tinged osmanthus over soft musks. Quietly luminous, never loud."
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/BL2157_BEYOND_VIBRANT_HIBISCUS_pgiehq-8c4cbc.webp",
    filename: "bottle-vibrant-hibiscus.webp",
    type: "image",
    title: "Vibrant Hibiscus",
    desc: "Bright hibiscus and pink pepper resting on creamy sandalwood."
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/BL2158_BEYOND_MELLOW_HELIOTROPE_agqych-36c451.webp",
    filename: "bottle-mellow-heliotrope.webp",
    type: "image",
    title: "Mellow Heliotrope",
    desc: "Almond, vanilla and heliotrope petals — a powdery, hushed warmth."
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/BL2371-BL2372-BL2373-Magnetic-Amber_web_2_dbmtpy-e68423.webp",
    filename: "bottle-magnetic-amber.webp",
    type: "image",
    title: "Magnetic Amber",
    desc: "Resinous amber, oud and rich woods. The collection's deepest note."
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/BL2156_BEYOND_RADIANT_OSMANTHUS_1_hlc4v1-572755.webp",
    filename: "bottle-crystal-edition.webp",
    type: "image",
    title: "Crystal Edition",
    desc: "A limited cut of the bottle — etched facets, lavender pour, leather collar."
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/hf_20260520_114550_b72cc2b7-2267-4d9e-b19f-f3bb4b0c7084-e5c560.mp4",
    filename: "hero-background.mp4",
    type: "video"
  },
  {
    url: "https://plugin-assets.open-design.ai/plugins/luxury-botanical/pasted-1779282335552-1_gmztyi-eccf42.webp",
    filename: "stay-section-botanical.webp",
    type: "image"
  }
];

async function downloadAssets() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');

  // 2. Crear la carpeta public/assets si no existe
  await fs.mkdir(assetsDir, { recursive: true });
  console.log('📁 Carpeta public/assets lista.\n');

  // 3. Descargar cada archivo
  for (const asset of assetsToDownload) {
    console.log(`⬇️ Descargando: ${asset.filename}...`);
    try {
      const response = await fetch(asset.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(path.join(assetsDir, asset.filename), buffer);
      console.log(`✅ Guardado: ${asset.filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`❌ Error descargando ${asset.filename}:`, error.message);
    }
  }

  // 4. Generar el archivo de datos actualizado para React
  const orbitImagesData = assetsToDownload.filter(a => a.type === 'image' && a.title);
  const videoAsset = assetsToDownload.find(a => a.type === 'video');
  const stayImageAsset = assetsToDownload.find(a => a.filename === 'stay-section-botanical.webp');

  const jsContent = `// Este archivo fue generado automáticamente por download-assets.mjs
// No lo edites manualmente, o tus cambios se sobrescribirán la próxima vez que ejecutes el script.

export const orbitImagesData = ${JSON.stringify(orbitImagesData.map(a => ({
  src: `/assets/${a.filename}`,
  title: a.title,
  desc: a.desc
})), null, 2)};

export const VIDEO_SRC = "/assets/${videoAsset.filename}";
export const STAY_SECTION_IMAGE = "/assets/${stayImageAsset.filename}";
export const TARGET_RADIUS = 650;
`;

  const dataDir = path.join(process.cwd(), 'src', 'data');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, 'assets.js'), jsContent);

  console.log('\n🚀 ¡Proceso completado!');
  console.log('📄 Se ha generado/actualizado: src/data/assets.js');
  console.log('💡 Ahora puedes usar estas rutas locales en tus componentes.');
}

downloadAssets();