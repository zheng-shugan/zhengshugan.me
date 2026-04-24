const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.resolve(__dirname, "../src/content/blog");
const PUBLIC_IMG_DIR = path.resolve(__dirname, "../public/img/post");

function migratePost(file, blogDir, publicImgDir) {
  const filePath = path.join(blogDir, file);
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) return { status: "skip", reason: "already a directory" };

  const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) return { status: "skip", reason: "no date prefix" };

  const date = dateMatch[1];
  const dirName = file.replace(/\.md$/, "");
  const targetDir = path.join(blogDir, dirName);
  const targetFile = path.join(targetDir, file);
  const attachmentsDir = path.join(targetDir, "Attachments");

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(attachmentsDir, { recursive: true });

  fs.renameSync(filePath, targetFile);

  let imagesCopied = 0;
  const imgDir = path.join(publicImgDir, date);
  if (fs.existsSync(imgDir)) {
    const images = fs.readdirSync(imgDir);
    for (const img of images) {
      const imgSrc = path.join(imgDir, img);
      const imgDest = path.join(attachmentsDir, img);
      fs.copyFileSync(imgSrc, imgDest);
      imagesCopied++;
    }
  }

  let content = fs.readFileSync(targetFile, "utf-8");
  const imgRegex = /!\[([^\]]*)\]\(\/img\/post\/(?:zh\/)?\d{4}-\d{2}-\d{2}\/([^)]+)\)/g;
  let pathsRewritten = 0;
  content = content.replace(imgRegex, (match, alt, filename) => {
    const cleanFilename = filename.split("?")[0];
    const decodedFilename = decodeURIComponent(cleanFilename);
    pathsRewritten++;
    return `![${alt}](Attachments/${decodedFilename})`;
  });
  fs.writeFileSync(targetFile, content, "utf-8");

  return { status: "ok", imagesCopied, pathsRewritten };
}

function main() {
  const results = { migrated: 0, skipped: 0, imagesCopied: 0, pathsRewritten: 0 };

  // Chinese posts
  const zhDir = path.join(BLOG_DIR, "zh");
  const zhImgDir = path.join(PUBLIC_IMG_DIR, "zh");
  const zhFiles = fs.readdirSync(zhDir).filter((f) => f.endsWith(".md"));

  for (const file of zhFiles) {
    const r = migratePost(file, zhDir, zhImgDir);
    if (r.status === "ok") {
      results.migrated++;
      results.imagesCopied += r.imagesCopied;
      results.pathsRewritten += r.pathsRewritten;
      console.log(
        `[ok]     ${file} (${r.imagesCopied} images, ${r.pathsRewritten} paths)`
      );
    } else {
      results.skipped++;
      console.log(`[skip]   ${file} (${r.reason})`);
    }
  }

  // English posts
  const enFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  for (const file of enFiles) {
    const r = migratePost(file, BLOG_DIR, PUBLIC_IMG_DIR);
    if (r.status === "ok") {
      results.migrated++;
      results.imagesCopied += r.imagesCopied;
      results.pathsRewritten += r.pathsRewritten;
      console.log(
        `[ok]     ${file} (${r.imagesCopied} images, ${r.pathsRewritten} paths)`
      );
    } else {
      results.skipped++;
      console.log(`[skip]   ${file} (${r.reason})`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Migrated:      ${results.migrated}`);
  console.log(`Skipped:       ${results.skipped}`);
  console.log(`Images copied: ${results.imagesCopied}`);
  console.log(`Paths rewrite: ${results.pathsRewritten}`);
}

main();
