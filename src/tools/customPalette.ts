import addStylesheet from "@/utils/addStylesheet";

const STYLE_ID = "asw-custom-palette-style";
const CONTENT_SCOPE = ":where(:not(.asw-container):not(.asw-container *))";

export type CustomPaletteCategory = "backgrounds" | "headings" | "contents";

export interface ICustomPaletteState {
    enabled?: boolean;
    activeCategory?: CustomPaletteCategory;
    colors?: Partial<Record<CustomPaletteCategory, string>>;
}

const DEFAULT_COLORS: Record<CustomPaletteCategory, string> = {
    backgrounds: "#ffffff",
    headings: "#0a53ff",
    contents: "#111827"
};

function sanitizeColor(color?: string, fallback = "#000000") {
    const value = (color || "").trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback;
}

export function removeCustomPalette() {
    document.getElementById(STYLE_ID)?.remove();
    document.documentElement.classList.remove("asw-custom-palette");
}

export default function customPalette(state?: ICustomPaletteState) {
    if (!state || !state.enabled) {
        removeCustomPalette();
        return;
    }

    const backgrounds = sanitizeColor(state.colors?.backgrounds, DEFAULT_COLORS.backgrounds);
    const headings = sanitizeColor(state.colors?.headings, DEFAULT_COLORS.headings);
    const contents = sanitizeColor(state.colors?.contents, DEFAULT_COLORS.contents);

    const css = `
        html.asw-custom-palette body {
            background-color: ${backgrounds} !important;
        }

        html.asw-custom-palette body ${CONTENT_SCOPE} {
            color: ${contents} !important;
        }

        html.asw-custom-palette body ${CONTENT_SCOPE} h1,
        html.asw-custom-palette body ${CONTENT_SCOPE} h2,
        html.asw-custom-palette body ${CONTENT_SCOPE} h3,
        html.asw-custom-palette body ${CONTENT_SCOPE} h4,
        html.asw-custom-palette body ${CONTENT_SCOPE} h5,
        html.asw-custom-palette body ${CONTENT_SCOPE} h6 {
            color: ${headings} !important;
        }
    `;

    addStylesheet({
        id: STYLE_ID,
        css
    });

    document.documentElement.classList.add("asw-custom-palette");
}

export const DEFAULT_CUSTOM_PALETTE_STATE: Required<ICustomPaletteState> = {
    enabled: false,
    activeCategory: "backgrounds",
    colors: { ...DEFAULT_COLORS }
};
