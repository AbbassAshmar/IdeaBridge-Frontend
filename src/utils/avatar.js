function hashText(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
}

export function getAvatarData(rawLabel) {
  const label = String(rawLabel || "User").trim();
  const initial = label.charAt(0).toUpperCase() || "U";
  const hue = hashText(label) % 360;

  return {
    initial,
    style: {
      backgroundColor: `hsl(${hue} 65% 40%)`,
    },
  };
}
