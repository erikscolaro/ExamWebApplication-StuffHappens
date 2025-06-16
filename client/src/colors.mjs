const WHITE = "rgba(255, 255, 255, 1)";
const GRAY_50 = "rgba(249, 250, 251, 1)";
const GRAY_100 = "rgba(243, 244, 246, 1)";
const GRAY_200 = "rgba(233, 236, 239, 1)";
const GRAY_300 = "rgba(220, 224, 228, 1)";
const GRAY_400 = "rgba(200, 204, 208, 1)";
const GRAY_500 = "rgba(160, 165, 170, 1)";
const GRAY_600 = "rgba(120, 125, 130, 1)";
const GRAY_700 = "rgba(80, 85, 90, 1)";
const GRA7_750 = "rgba(60, 65, 70, 1)";
const GRAY_800 = "rgba(40, 45, 50, 1)";
const GRAY_850 = "rgba(30, 34, 38, 1)";
const GRAY_900 = "rgba(20, 24, 28, 1)";
const BLACK = "rgba(0, 0, 0, 1)";
const DARK_TRANSPARENT = "rgba(0, 0, 0, 0.60)"; // Assuming this is the intended value
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const ACCENT2 = "rgba(252, 198, 3, 1)";
const ACCENT = "rgba(255, 163, 26,1)";
const ACCENT_TRANSPARENT = "rgba(255, 163, 26,0.25)";
const ACCENT_DARK2 = "rgba(252, 186, 3,1)";
const ACCENT_DARK = "rgb(255, 152, 26)";
const ACCENT_DARK_TRANSPARENT = "rgba(255, 152, 26,0.25)";

export const colors = {
  background: {
    white: WHITE,
    gray_50: GRAY_50,
    gray_100: GRAY_100,
    gray_200: GRAY_200,
    gray_300: GRAY_300,
    gray_400: GRAY_400,
    gray_500: GRAY_500,
    gray_600: GRAY_600,
    gray_700: GRAY_700,
    gray_750: GRA7_750,
    gray_800: GRAY_800,
    gray_850: GRAY_850,
    gray_900: GRAY_900,
    black: BLACK,
    darkTransparent: DARK_TRANSPARENT,
    accent: ACCENT,
    accentDark: ACCENT_DARK,
    accentTransparent: ACCENT_TRANSPARENT,
    accentDarkTransparent: ACCENT_DARK_TRANSPARENT,
    transparent: TRANSPARENT,
  },
  text: {
    accent: ACCENT,
    light: GRAY_300,
    dark: GRAY_900,
    black: BLACK,
  },
  border: {
    transparent: TRANSPARENT,
    accent: ACCENT,
    accentDark: ACCENT_DARK,
    accentTransparent: ACCENT_TRANSPARENT,
    accentDarkTransparent: ACCENT_DARK_TRANSPARENT,
    light: GRAY_200,
    dark: GRAY_900,
  },
  logic: {
    success: "rgba(40, 167, 69, 1)" ,
    error: "rgba(220, 53, 69, 1)",
  },
};
