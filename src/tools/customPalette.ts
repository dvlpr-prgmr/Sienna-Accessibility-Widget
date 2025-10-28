import addStylesheet from "@/utils/addStylesheet";

const STYLE_ID = "asw-custom-palette-style";
const DEFAULT_TEXT_COLOR = "#000000";
const DEFAULT_BACKGROUND_COLOR = "#ffffff";

export interface ICustomPaletteState {
    enabled?: boolean;
    textColor?: string;
    backgroundColor?: string;
}

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

    const textColor = sanitizeColor(state.textColor, DEFAULT_TEXT_COLOR);
    const backgroundColor = sanitizeColor(state.backgroundColor, DEFAULT_BACKGROUND_COLOR);

    const css = `
        html.asw-custom-palette, html.asw-custom-palette body {
            color: ${textColor} !important;
            background-color: ${backgroundColor} !important;
        }

        html.asw-custom-palette body * {
            color: inherit;
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
    textColor: DEFAULT_TEXT_COLOR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR
};
