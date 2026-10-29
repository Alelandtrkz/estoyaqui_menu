import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(projectRoot, "img-source");
const legacySourceDirectory = path.join(projectRoot, "image-source");
const outputDirectory = path.join(projectRoot, "img");
const menuDataFile = path.join(projectRoot, "js", "menu-data.js");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getExpectedImages() {
  const source = await readFile(menuDataFile, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: menuDataFile });

  if (!Array.isArray(context.window.MENU_DATA)) {
    throw new Error("js/menu-data.js no define window.MENU_DATA correctamente.");
  }

  return new Set(
    context.window.MENU_DATA.flatMap((section) =>
      section.items.map((item) => item.image)
    )
  );
}

async function collectSourceImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const images = [];
  const outputNames = new Map();

  for (const entry of entries) {
    if (entry.name === ".gitkeep") continue;
    if (entry.isDirectory() && entry.name === "archive") continue;
    if (!entry.isFile()) {
      throw new Error(`Solo se permiten archivos dentro de ${path.basename(directory)}: ${entry.name}`);
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!supportedExtensions.has(extension)) {
      throw new Error(
        `Formato no compatible: ${entry.name}. Usa JPG, JPEG, PNG o WebP.`
      );
    }

    const normalizedName = slugify(path.basename(entry.name, extension));
    if (!normalizedName) {
      throw new Error(`No se pudo crear un nombre válido para ${entry.name}.`);
    }

    const outputName = `${normalizedName}.webp`;
    if (outputNames.has(outputName)) {
      throw new Error(
        `Los archivos "${outputNames.get(outputName)}" y "${entry.name}" producen el mismo nombre: ${outputName}`
      );
    }

    outputNames.set(outputName, entry.name);
    images.push({
      inputPath: path.join(directory, entry.name),
      originalName: entry.name,
      outputName,
      outputPath: path.join(outputDirectory, outputName),
      isLogo: normalizedName === "logo-ea"
    });
  }

  return images;
}

async function optimizeImage(image) {
  if (image.isLogo) {
    const circularMask = Buffer.from(`
      <svg width="512" height="512" viewBox="0 0 512 512">
        <circle cx="256" cy="256" r="256" fill="white"/>
      </svg>
    `);
    const masterLogo = await sharp(image.inputPath, { failOn: "error" })
      .rotate()
      .resize({
        width: 512,
        height: 512,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .ensureAlpha()
      .composite([{ input: circularMask, blend: "dest-in" }])
      .png()
      .toBuffer();

    await Promise.all([
      sharp(masterLogo)
        .webp({ quality: 90, alphaQuality: 100, effort: 4 })
        .toFile(image.outputPath),
      sharp(masterLogo)
        .resize(64, 64)
        .png({ compressionLevel: 9 })
        .toFile(path.join(outputDirectory, "favicon.png")),
      sharp(masterLogo)
        .resize(180, 180)
        .png({ compressionLevel: 9 })
        .toFile(path.join(outputDirectory, "apple-touch-icon.png"))
    ]);

    console.log(`✓ ${image.originalName} -> img/${image.outputName}`);
    console.log("  + img/favicon.png");
    console.log("  + img/apple-touch-icon.png");
  } else {
    await sharp(image.inputPath, { failOn: "error" })
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(image.outputPath);

    console.log(`✓ ${image.originalName} -> img/${image.outputName}`);
  }
}

async function main() {
  await mkdir(sourceDirectory, { recursive: true });
  await mkdir(legacySourceDirectory, { recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  const [expectedImages, legacyImages, newImages] = await Promise.all([
    getExpectedImages(),
    collectSourceImages(legacySourceDirectory),
    collectSourceImages(sourceDirectory)
  ]);
  // Los originales nuevos tienen prioridad sobre los de la carpeta anterior.
  const sourceImages = [...new Map(
    [...legacyImages, ...newImages].map((image) => [image.outputName, image])
  ).values()];

  if (sourceImages.length === 0) {
    console.log("No hay imágenes para convertir en img-source ni image-source.");
  } else {
    for (const image of sourceImages) {
      await optimizeImage(image);
    }
  }

  const producedNames = new Set(sourceImages.map((image) => image.outputName));
  const existingOutputs = await readdir(outputDirectory, { withFileTypes: true });
  const availableNames = new Set(
    existingOutputs
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".webp"))
      .map((entry) => entry.name)
  );

  const missingImages = [...expectedImages].filter((name) => !availableNames.has(name));
  const unreferencedImages = [...producedNames].filter(
    (name) => name !== "logo-ea.webp" && !expectedImages.has(name)
  );

  console.log(`\n${sourceImages.length} imagen(es) procesada(s).`);

  if (missingImages.length > 0) {
    console.warn(`\nFotos pendientes (${missingImages.length}):`);
    missingImages.forEach((name) => console.warn(`- ${name}`));
  }

  if (unreferencedImages.length > 0) {
    console.warn("\nImágenes convertidas que no están asociadas al menú:");
    unreferencedImages.forEach((name) => console.warn(`- ${name}`));
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
