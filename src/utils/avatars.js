const avatarPalettes = {
  elder: {
    bg: "#FFE4CF",
    shirt: "#8FB8A2",
    hair: "#D9D2C4",
    face: "#F2C6A0",
    accent: "#F39B64",
  },
  elderMale: {
    bg: "#DCEEFF",
    shirt: "#86A9C6",
    hair: "#C9C2B8",
    face: "#EFC19A",
    accent: "#6A8F74",
  },
  elderFemale: {
    bg: "#DCEFD9",
    shirt: "#D99B75",
    hair: "#D8D0C2",
    face: "#F1C9A7",
    accent: "#F39B64",
  },
};

function encodeSvg(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getChineseElderAvatar(id = "", gender = "女") {
  const palette =
    gender === "男"
      ? avatarPalettes.elderMale
      : gender === "女"
        ? avatarPalettes.elderFemale
        : avatarPalettes.elder;
  const isMale = gender === "男";
  const seed = String(id).charCodeAt(String(id).length - 1) || 1;
  const glasses = seed % 2 === 0;

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="38" fill="${palette.bg}"/>
      <circle cx="80" cy="72" r="45" fill="${palette.hair}"/>
      ${isMale ? `<path d="M43 70c5-26 19-39 38-39s33 13 37 39c-16-10-52-10-75 0Z" fill="#BDB5A8"/>` : `<path d="M35 80c4-35 22-53 45-53s42 18 45 53c-21-15-68-15-90 0Z" fill="#CFC7B9"/>`}
      <circle cx="80" cy="78" r="36" fill="${palette.face}"/>
      <path d="M49 125c9-24 22-34 31-34s23 10 32 34v35H49v-35Z" fill="${palette.shirt}"/>
      <path d="M62 109c10 9 27 9 37 0" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
      <circle cx="66" cy="75" r="4" fill="#4B433A"/>
      <circle cx="94" cy="75" r="4" fill="#4B433A"/>
      ${glasses ? `<circle cx="66" cy="75" r="10" fill="none" stroke="#6F6258" stroke-width="3"/><circle cx="94" cy="75" r="10" fill="none" stroke="#6F6258" stroke-width="3"/><path d="M76 75h8" stroke="#6F6258" stroke-width="3" stroke-linecap="round"/>` : ""}
      <path d="M68 94c7 7 17 7 24 0" fill="none" stroke="#9A5F4E" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 59c8-8 21-12 30-12s23 4 31 12" fill="none" stroke="${palette.accent}" stroke-width="5" stroke-linecap="round"/>
    </svg>
  `);
}

export function isGeneratedChineseElderAvatar(avatar = "") {
  return String(avatar).startsWith("data:image/svg+xml");
}
