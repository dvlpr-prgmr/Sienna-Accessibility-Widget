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
    const $customPaletteToggle = document.querySelector<HTMLButtonElement>(".asw-custom-palette-toggle");
    const $customPaletteCard = document.querySelector<HTMLElement>(".asw-custom-palette-card");
    const $customTextColor = document.querySelector<HTMLInputElement>(".asw-custom-palette-text");
    const $customBackgroundColor = document.querySelector<HTMLInputElement>(".asw-custom-palette-background");
    const $customPaletteCheckbox = document.querySelector<HTMLInputElement>(".asw-custom-palette-checkbox");

    if ($positionToggle && $positionCard) {
        $positionToggle.setAttribute("aria-expanded", "false");
        $positionCard.classList.remove("asw-position-open");
    }

    if ($settingsToggle && $settingsCard) {
        $settingsToggle.setAttribute("aria-expanded", "false");
        $settingsCard.classList.remove("asw-settings-open");
    }

    if ($customPaletteToggle && $customPaletteCard) {
        $customPaletteToggle.setAttribute("aria-expanded", "false");
        $customPaletteCard.classList.remove("asw-custom-palette-open");
    }

    if ($customTextColor) {
        $customTextColor.value = "#000000";
    }

    if ($customBackgroundColor) {
        $customBackgroundColor.value = "#ffffff";
    }

    if ($customPaletteCheckbox) {
        $customPaletteCheckbox.checked = false;
    }

    runAccessibility();
    saveUserSettings();
    changeLanguage(pluginDefaults.lang);
}
