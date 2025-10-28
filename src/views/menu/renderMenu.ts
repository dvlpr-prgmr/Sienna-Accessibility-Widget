// @ts-ignore
import template from "./menu.html";

import FilterButtons from "./FilterButtons";
import ContentButtons from "./ContentButtons";
import ToolButtons from "../../enum/TOOL_PRESETS";
import widgetSettingsIcon from "../../icons/widgetSettingsIcon.svg";

import renderButtons from "./renderButtons";
import adjustFontSize from "../../tools/adjustFontSize";
import renderTools from "./renderTools";
import reset from "./reset";

import { ILanguage, LANGUAGES, resolveLanguageCode } from "../../i18n/Languages";

import css from "./menu.css";
import enableContrast from "@/tools/enableContrast";
import { pluginConfig } from "@/globals/pluginConfig";
import { userSettings, saveUserSettings } from "@/globals/userSettings";
import { changeLanguage } from "@/i18n/changeLanguage";
import toggleMenu from "./toggleMenu";
import { $widget, applyButtonPosition } from "../widget/widget";

export default function renderMenu() {
    const $container: HTMLElement = document.createElement("div");
    $container.innerHTML = `<style>${css}</style>` + template;

    const $menu = $container.querySelector(".asw-menu");
    if (pluginConfig?.position?.includes("right")) {
        $menu.style.right = '0px';
        $menu.style.left = 'auto';
    }

    $menu.querySelector(".content").innerHTML = renderButtons(ContentButtons);
    $menu.querySelector(".tools").innerHTML = renderButtons(ToolButtons, 'asw-tools');
    $menu.querySelector(".contrast").innerHTML = renderButtons(FilterButtons, 'asw-filter');

    // *** States UI Rendering ***
    const states = userSettings?.states;

    const fontSize = Number(states?.fontSize) || 1;
    if (fontSize != 1) {
        $menu.querySelector(".asw-amount").innerHTML = `${fontSize * 100}%`;
    }

    if (states) {
        const buttons = Array.from($menu.querySelectorAll('.asw-btn'));

        Object.entries(states).forEach(([key, value]) => {
            if (value && key !== "fontSize") {
                const selector = key === "contrast" ? states[key] : key;
                const btn = buttons.find(b => b.dataset.key === selector);
                if (btn) btn.classList.add("asw-selected");
            }
        });
    }

    // *** Widget Placement ***
    const currentPosition = userSettings.position || pluginConfig.position || "bottom-left";
    const $positionToggle = $menu.querySelector<HTMLButtonElement>(".asw-position-toggle");
    const $positionCard = $menu.querySelector<HTMLElement>(".asw-position-card");
    const $settingsToggle = $menu.querySelector<HTMLButtonElement>(".asw-settings-toggle");
    const $settingsCard = $menu.querySelector<HTMLElement>(".asw-settings-card");
    const $settingsIcon = $menu.querySelector<HTMLElement>(".asw-settings-icon");

    if ($settingsIcon) {
        $settingsIcon.innerHTML = widgetSettingsIcon;
    }

    const setSettingsVisibility = (expanded: boolean) => {
        if (!$settingsCard || !$settingsToggle) {
            return;
        }

        $settingsToggle.setAttribute("aria-expanded", String(expanded));
        $settingsCard.classList.toggle("asw-settings-open", expanded);
    };

    if ($settingsToggle) {
        setSettingsVisibility(false);
        $settingsToggle.addEventListener("click", () => {
            const expanded = $settingsToggle.getAttribute("aria-expanded") !== "true";
            setSettingsVisibility(expanded);
        });
    }

    const setPositionGridVisibility = (expanded: boolean) => {
        if (!$positionCard || !$positionToggle) {
            return;
        }

        $positionToggle.setAttribute("aria-expanded", String(expanded));
        $positionCard.classList.toggle("asw-position-open", expanded);
    };

    if ($positionToggle) {
        setPositionGridVisibility(false);
        $positionToggle.addEventListener("click", () => {
            const expanded = $positionToggle.getAttribute("aria-expanded") !== "true";
            if (expanded) {
                setSettingsVisibility(true);
            }
            setPositionGridVisibility(expanded);
        });
    }

    const positionButtons = Array.from($menu.querySelectorAll<HTMLButtonElement>(".asw-position-btn"));

    positionButtons.forEach((button) => {
        button.classList.toggle("asw-selected", button.dataset.position === currentPosition);
        button.addEventListener("click", () => {
            const selectedPosition = button.dataset.position;
            if (!selectedPosition) {
                return;
            }

            positionButtons.forEach((btn) =>
                btn.classList.toggle("asw-selected", btn === button)
            );

            pluginConfig.position = selectedPosition;
            userSettings.position = selectedPosition;
            if (selectedPosition.includes("right")) {
                $menu.style.right = "0px";
                $menu.style.left = "auto";
            } else {
                $menu.style.left = "0px";
                $menu.style.right = "auto";
            }
            saveUserSettings();
            applyButtonPosition();
            setSettingsVisibility(true);
            setPositionGridVisibility(true);
        });
    });

    applyButtonPosition();

    // *** Translations ***
    userSettings.lang = resolveLanguageCode(userSettings.lang || pluginConfig?.lang);

    const $lang = $menu.querySelector<HTMLSelectElement>("#asw-language");

    const populateLanguageOptions = () => {
        if (!$lang) {
            return;
        }

        const langOptions = LANGUAGES.map((lang: ILanguage) => `<option value="${lang.code}">${lang.label}</option>`).join('');
        const previousValue = $lang.value;
        $lang.innerHTML = langOptions;

        const desiredValue = LANGUAGES.some((lang) => lang.code === userSettings.lang)
            ? userSettings.lang
            : resolveLanguageCode(previousValue);

        if (LANGUAGES.some((lang) => lang.code === desiredValue)) {
            $lang.value = desiredValue;
        }
    };

    populateLanguageOptions();

    $lang?.addEventListener("change", (event) => {
        changeLanguage((event.target as HTMLSelectElement).value);
    });

    document.addEventListener("asw:languages:updated", populateLanguageOptions);

    // *** Utils ***
    $container.querySelectorAll('.asw-menu-close, .asw-overlay').forEach((el) =>
        el.addEventListener('click', toggleMenu)
    );

    $container.querySelectorAll('.asw-menu-reset').forEach((el) =>
        el.addEventListener('click', reset)
    );

    // *** Controls ***
    $menu.querySelectorAll(".asw-plus, .asw-minus").forEach((el: HTMLElement) => {
        el.addEventListener("click", () => {
            const difference = 0.1;

            let fontSize = userSettings?.states?.fontSize || 1;
            if (el.classList.contains('asw-minus')) {
                fontSize -= difference;
            } else {
                fontSize += difference;
            }

            fontSize = Math.max(fontSize, 0.1);
            fontSize = Math.min(fontSize, 2);
            fontSize = Number(fontSize.toFixed(2));

            document.querySelector(".asw-amount").textContent = `${(fontSize * 100).toFixed(0)}%`;

            adjustFontSize(fontSize);
            userSettings.states.fontSize = fontSize;

            saveUserSettings();
        });
    });

    $menu.querySelectorAll(".asw-btn").forEach((el: HTMLElement) => {
        el.addEventListener("click", () => {
            const key = el.dataset.key;
            const isSelected = !el.classList.contains("asw-selected");
            
            // --- Contrast ---
            if (el.classList.contains("asw-filter")) {
                $menu.querySelectorAll(".asw-filter").forEach((el: HTMLElement) =>
                    el.classList.remove("asw-selected")
                );

                if (isSelected) {
                    el.classList.add("asw-selected");
                }

                userSettings.states.contrast = isSelected ? key : false;
                enableContrast(userSettings.states.contrast);

                saveUserSettings();

                return;
            }
            
            el.classList.toggle("asw-selected", isSelected);
            userSettings.states[key] = isSelected;
            renderTools();

            saveUserSettings();
        });
    });

    $widget.appendChild($container);

    return $container;
}
