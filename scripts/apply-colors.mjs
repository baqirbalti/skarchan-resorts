import fs from "fs";
import path from "path";

const quoted = [
  ["#F5EFE6", "colors.cream"],
  ["#EDE0CE", "colors.creamDark"],
  ["#EEE5D6", "colors.creamCard"],
  ["#F9F6F0", "colors.creamSection"],
  ["#f9f6f0", "colors.creamSection"],
  ["#FDFBF7", "colors.creamInput"],
  ["#F0EBE1", "colors.creamDivider"],
  ["#F8F5F0", "colors.creamSubtle"],
  ["#EAE1D5", "colors.borderLight"],
  ["#E0D8C8", "colors.dividerSoft"],
  ["#E5E5E5", "colors.borderGray"],
  ["#EFEFEF", "colors.grayBg"],
  ["#FFFFFF", "colors.white"],
  ["#1C1209", "colors.darker"],
  ["#2C1F14", "colors.dark"],
  ["#3D2D1E", "colors.darkBorder"],
  ["#C4922A", "colors.gold"],
  ["#C9922A", "colors.goldLine"],
  ["#D9A84E", "colors.goldLight"],
  ["#D9933D", "colors.goldAccent"],
  ["#A67520", "colors.goldHover"],
  ["#C49B66", "colors.goldSubmit"],
  ["#C9B79A", "colors.goldDisabled"],
  ["#984A1C", "colors.terracotta"],
  ["#7A3B16", "colors.terracottaHover"],
  ["#7A6652", "colors.textMuted"],
  ["#8C7B6B", "colors.stone"],
  ["#A89582", "colors.textWarm"],
  ["#555555", "colors.textSecondary"],
  ["#25D366", "colors.whatsapp"],
  ["#e07070", "colors.error"],
  ["#C0392B", "colors.errorDark"],
  ["#003b95", "colors.bookingBlue"],
  ["#33b5e5", "colors.bookingCyan"],
  ["#E28743", "colors.avatarOrange"],
  ["#EDE6D8", "colors.borderWarm"],
  ["#F1ECE1", "colors.borderHairline"],
  ["#FBF3E6", "colors.selectionBg"],
  ["#E7D9BE", "colors.selectionBorder"],
  ["rgba(255, 255, 255, 0.98)", "colors.overlayWhite"],
  ["rgba(0,0,0,0.65)", "colors.overlayBlack"],
  ["rgba(0,0,0,0.3)", "colors.overlayBlackSoft"],
  ["linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)", "colors.overlayHero"],
  ["rgba(30,18,8,0.52)", "colors.overlayBrown"],
  ["rgba(30,18,8,0.75)", "colors.overlayBrownStrong"],
  ["rgba(18,10,4,0.97)", "colors.overlayLightbox"],
  ["rgba(245,239,230,0.3)", "colors.creamMuted"],
  ["rgba(196,146,42,0.12)", "colors.goldWash"],
  ["rgba(196,146,42,0.3)", "colors.goldWashBorder"],
  ["rgba(200,180,154,0.2)", "colors.footerRule"],
  ["#FFF", "colors.white"],
  ["#fff", "colors.white"],
  ["#333", "colors.textBody"],
  ["#444", "colors.textBodyAlt"],
  ["#555", "colors.textSecondary"],
  ["#666", "colors.textTertiary"],
  ["#777", "colors.textHint"],
  ["#999", "colors.textFaint"],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === "theme") continue;
      walk(p, files);
    } else if (p.endsWith(".jsx")) files.push(p);
  }
  return files;
}

function replaceValue(inner) {
  let next = inner;
  for (const [hex, token] of quoted) {
    if (next.includes(hex)) next = next.split(hex).join("${" + token + "}");
  }
  return next;
}

function process(src) {
  // JSX attr fill="#HEX"
  src = src.replace(/(\w+)=("#(?:[0-9A-Fa-f]{3,8})")/g, (m, attr, quotedStr) => {
    const inner = quotedStr.slice(1, -1);
    const mapped = quoted.find(([hex]) => hex === inner);
    if (!mapped) return m;
    return `${attr}={${mapped[1]}}`;
  });

  return src.replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, (m, q, inner) => {
    if (q === "`") {
      const next = replaceValue(inner);
      return "`" + next + "`";
    }
    const next = replaceValue(inner);
    if (next === inner) return m;
    if (/^\$\{colors\.[A-Za-z]+\}$/.test(next)) return next.slice(2, -1);
    return "`" + next + "`";
  });
}

function addImport(src, file) {
  if (src.includes("theme/colors.js")) return src;
  const spec = file.replace(/\\/g, "/").endsWith("/App.jsx")
    ? "./theme/colors.js"
    : "../theme/colors.js";
  const line = `import { colors } from "${spec}";`;
  const matches = [...src.matchAll(/^import .+$/gm)];
  if (!matches.length) return line + "\n" + src;
  const last = matches[matches.length - 1];
  const idx = last.index + last[0].length;
  return src.slice(0, idx) + "\n" + line + src.slice(idx);
}

for (const file of walk("src")) {
  let src = fs.readFileSync(file, "utf8");
  const next = process(src);
  if (next !== src) {
    fs.writeFileSync(file, addImport(next, file));
    console.log("updated", file);
  } else {
    console.log("unchanged", file);
  }
}
