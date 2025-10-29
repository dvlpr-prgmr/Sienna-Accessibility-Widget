import { saveUserSettings, userSettings } from "@/globals/userSettings";
import { pluginConfig, pluginDefaults } from "@/globals/pluginConfig";
import runAccessibility from "./runAccessibility";
import { applyButtonPosition, applyButtonIcon } from "../widget/widget";
import { changeLanguage } from "@/i18n/changeLanguage";

export default function reset() {
    document?.querySelectorAll(".asw-selected")?.forEach(el => el?.classList?.remove("asw-selected"))

    userSettings.states = {};
    userSettings.position = undefined;
    userSettings.offset = undefined;
    userSettings.lang = undefined;

    pluginConfig.lang = pluginDefaults.lang;
    pluginConfig.position = pluginDefaults.position;
    pluginConfig.offset = Array.isArray(pluginDefaults.offset) ? [...pluginDefaults.offset] : [20, 20];
    pluginConfig.size = pluginDefaults.size;
    pluginConfig.icon = pluginDefaults.icon;

    applyButtonPosition();
    applyButtonIcon();

    const positionButtons = document.querySelectorAll<HTMLButtonElement>(".asw-position-btn");
    positionButtons.forEach((btn) =>
        btn.classList.toggle("asw-selected", btn.dataset.position === pluginConfig.position)
    );

    const $positionToggle = document.querySelector<HTMLButtonElement>(".asw-position-toggle");
    const $positionCard = document.querySelector<HTMLElement>(".asw-position-card");
    const $settingsToggle = document.querySelector<HTMLButtonElement>(".asw-settings-toggle");
    const $settingsCard = document.querySelector<HTMLElement>(".asw-settings-card");
    const $customPaletteTabs = document.querySelectorAll<HTMLButtonElement>(".asw-custom-palette-tab");
    const $customPaletteRange = document.querySelector<HTMLInputElement>(".asw-custom-palette-range");
    const $customPaletteBars = document.querySelectorAll<HTMLDivElement>(".asw-contrast-bars");

    if ($positionToggle && $positionCard) {
        $positionToggle.setAttribute("aria-expanded", "false");
        $positionCard.classList.remove("asw-position-open");
    }

    if ($settingsToggle && $settingsCard) {
        $settingsToggle.setAttribute("aria-expanded", "false");
        $settingsCard.classList.remove("asw-settings-open");
    }

    $customPaletteTabs.forEach((tab) => {
        const isBackgrounds = tab.dataset.category === "backgrounds";
        tab.classList.toggle("is-active", isBackgrounds);
        tab.setAttribute("aria-selected", String(isBackgrounds));
    });

    if ($customPaletteRange) {
        $customPaletteRange.value = "0";
        $customPaletteRange.style.removeProperty("--asw-palette-gradient");
        $customPaletteRange.style.removeProperty("--asw-palette-thumb");
    }

    $customPaletteBars.forEach((barContainer) => {
        barContainer.classList.remove("is-visible");
        barContainer.querySelectorAll(".asw-contrast-bar").forEach((bar) => bar.classList.remove("is-active"));
    });

    const $contrastCycleButton = document.querySelector<HTMLButtonElement>('.asw-filter[data-key="contrast-cycle"]');
    if ($contrastCycleButton) {
        $contrastCycleButton.setAttribute("aria-pressed", "false");
        const label = $contrastCycleButton.querySelector<HTMLSpanElement>('.asw-translate');
        if (label) {
            label.setAttribute("data-translate", "Contrast");
            label.textContent = "Contrast";
        }
        $contrastCycleButton.querySelectorAll('.asw-contrast-bar').forEach((bar) => bar.classList.remove('is-active'));
        $contrastCycleButton.querySelector('.asw-contrast-bars')?.classList.remove('is-visible');
    }

    runAccessibility();
    saveUserSettings();
    changeLanguage(pluginDefaults.lang);
}
