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
import { DEFAULT_CUSTOM_PALETTE_STATE, ICustomPaletteState } from "@/tools/customPalette";
import { t } from "@/i18n/translate";

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

    const $contrastGrid = $menu.querySelector(".contrast");
    $contrastGrid.innerHTML = renderButtons(FilterButtons, 'asw-filter');

    const $contrastButtons = Array.from($menu.querySelectorAll<HTMLButtonElement>(".asw-contrast-option"));

    // *** States UI Rendering ***
    const states = userSettings?.states;
    const filterButtons = Array.from($menu.querySelectorAll<HTMLButtonElement>('.asw-filter'));

    const fontSize = Number(states?.fontSize) || 1;
    if (fontSize != 1) {
        $menu.querySelector(".asw-amount").innerHTML = `${fontSize * 100}%`;
    }

    if (states) {
        const buttons = Array.from($menu.querySelectorAll('.asw-btn'));

        Object.entries(states).forEach(([key, value]) => {
            if (!value || key === "fontSize") {
                return;
            }

            if (typeof value === "object" && key !== "contrast") {
                return;
            }

            const selector = key === "contrast" ? states[key] : key;
            const btn = buttons.find(b => b.dataset.key === selector);
            if (btn) btn.classList.add("asw-selected");
            if (key === "contrast" && typeof selector === "string") {
                filterButtons.forEach(b => {
                    if (b.dataset.key !== selector) {
                        b.classList.remove("asw-selected");
                    }
                });
            }
        });
    }

    const contrastCycleOrder = ["contrast", "dark-contrast", "light-contrast", "high-contrast"];
    const contrastLabelMap: Record<string, string> = {
        "dark-contrast": "Dark Contrast",
        "light-contrast": "Light Contrast",
        "high-contrast": "High Contrast"
    };

    const $contrastCycleButton = $menu.querySelector<HTMLButtonElement>('.asw-filter[data-key="contrast-cycle"]');
    const $contrastCycleLabel = $contrastCycleButton?.querySelector<HTMLSpanElement>('.asw-translate');

    const updateContrastCycleButton = (value: string | false | "contrast") => {
        if (!$contrastCycleButton || !$contrastCycleLabel) {
            return;
        }

        const isActive = typeof value === "string" && value !== "contrast" && contrastCycleOrder.includes(value);
        const translationKey = isActive ? contrastLabelMap[value as keyof typeof contrastLabelMap] : "Contrast";

        $contrastCycleButton.classList.toggle("asw-selected", isActive);
        $contrastCycleButton.setAttribute("aria-pressed", String(isActive));
        $contrastCycleLabel.setAttribute("data-translate", translationKey);
        $contrastCycleLabel.textContent = t(translationKey);

        const barsWrapper = $contrastCycleButton.querySelector<HTMLDivElement>(".asw-contrast-bars");
        const barElements = Array.from($contrastCycleButton.querySelectorAll<HTMLSpanElement>(".asw-contrast-bar"));

        barElements.forEach((bar) => bar.classList.remove("is-active"));

        if (isActive) {
            barsWrapper?.classList.add("is-visible");
            const activeStepIndex = Math.max(0, contrastCycleOrder.indexOf(value as string) - 1);
            barElements.forEach((bar, index) => {
                bar.classList.toggle("is-active", index <= activeStepIndex);
            });
        } else {
            barsWrapper?.classList.remove("is-visible");
        }
    };

    const getNextContrastValue = (current?: string | null) => {
        const index = current ? contrastCycleOrder.indexOf(current) : -1;
        const nextIndex = (index + 1) % contrastCycleOrder.length;
        return contrastCycleOrder[nextIndex];
    };

    updateContrastCycleButton(typeof states?.contrast === "string" ? states.contrast : false);

    // *** Widget Placement ***
    const currentPosition = userSettings.position || pluginConfig.position || "bottom-left";
    const $positionToggle = $menu.querySelector<HTMLButtonElement>(".asw-position-toggle");
    const $positionCard = $menu.querySelector<HTMLElement>(".asw-position-card");
    const $settingsToggle = $menu.querySelector<HTMLButtonElement>(".asw-settings-toggle");
    const $settingsCard = $menu.querySelector<HTMLElement>(".asw-settings-card");
    const $settingsIcon = $menu.querySelector<HTMLElement>(".asw-settings-icon");
    const $customPaletteCard = $menu.querySelector<HTMLElement>(".asw-custom-palette-card");
    const $customPaletteToggle = $menu.querySelector<HTMLButtonElement>(".asw-custom-palette-toggle");
    const $customTextColor = $menu.querySelector<HTMLInputElement>(".asw-custom-palette-text");
    const $customBackgroundColor = $menu.querySelector<HTMLInputElement>(".asw-custom-palette-background");
    const $customPaletteCheckbox = $menu.querySelector<HTMLInputElement>(".asw-custom-palette-checkbox");
    const $customPaletteReset = $menu.querySelector<HTMLButtonElement>(".asw-custom-palette-reset");

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

    const hasSavedPalette = Boolean(states && typeof states['custom-palette'] === "object" && states['custom-palette'] !== null);
    let paletteState: ICustomPaletteState = { ...DEFAULT_CUSTOM_PALETTE_STATE };
    if (hasSavedPalette && states) {
        paletteState = { ...paletteState, ...(states['custom-palette'] as ICustomPaletteState) };
        userSettings.states['custom-palette'] = paletteState;
    }

    const setCustomPaletteVisibility = (expanded: boolean) => {
        if (!$customPaletteCard || !$customPaletteToggle) {
            return;
        }

        $customPaletteToggle.setAttribute("aria-expanded", String(expanded));
        $customPaletteCard.classList.toggle("asw-custom-palette-open", expanded);
    };

    if ($customPaletteToggle) {
        setCustomPaletteVisibility(false);
        $customPaletteToggle.addEventListener("click", () => {
            const expanded = $customPaletteToggle.getAttribute("aria-expanded") !== "true";
            if (expanded) {
                setSettingsVisibility(true);
            }
            setCustomPaletteVisibility(expanded);
        });
    }

    if ($customTextColor) {
        $customTextColor.value = paletteState.textColor;
    }

    if ($customBackgroundColor) {
        $customBackgroundColor.value = paletteState.backgroundColor;
    }

    if ($customPaletteCheckbox) {
        $customPaletteCheckbox.checked = Boolean(paletteState.enabled);
    }

    if (paletteState.enabled) {
        setSettingsVisibility(true);
        setCustomPaletteVisibility(true);
    }

    const persistPaletteState = () => {
        const shouldRemove = !paletteState.enabled &&
            paletteState.textColor === DEFAULT_CUSTOM_PALETTE_STATE.textColor &&
            paletteState.backgroundColor === DEFAULT_CUSTOM_PALETTE_STATE.backgroundColor;

        if (shouldRemove) {
            delete userSettings.states['custom-palette'];
        } else {
            userSettings.states['custom-palette'] = paletteState;
        }
    };

    const updateCustomPalette = (partial: Partial<typeof paletteState>, apply = true) => {
        paletteState = { ...paletteState, ...partial };
        persistPaletteState();
        if (apply) {
            renderTools();
        }
        saveUserSettings();
    };

    $customTextColor?.addEventListener("input", (event) => {
        const value = (event.target as HTMLInputElement).value || DEFAULT_CUSTOM_PALETTE_STATE.textColor;
        updateCustomPalette({ textColor: value }, Boolean(paletteState.enabled));
    });

    $customBackgroundColor?.addEventListener("input", (event) => {
        const value = (event.target as HTMLInputElement).value || DEFAULT_CUSTOM_PALETTE_STATE.backgroundColor;
        updateCustomPalette({ backgroundColor: value }, Boolean(paletteState.enabled));
    });

    $customPaletteCheckbox?.addEventListener("change", (event) => {
        const enabled = (event.target as HTMLInputElement).checked;
        updateCustomPalette({ enabled }, true);
    });

    $customPaletteReset?.addEventListener("click", () => {
        const defaults = { ...DEFAULT_CUSTOM_PALETTE_STATE };
        if ($customTextColor) {
            $customTextColor.value = defaults.textColor;
        }
        if ($customBackgroundColor) {
            $customBackgroundColor.value = defaults.backgroundColor;
        }
        if ($customPaletteCheckbox) {
            $customPaletteCheckbox.checked = false;
        }
        paletteState = defaults;
        persistPaletteState();
        renderTools();
        saveUserSettings();
    });

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

            if (el.classList.contains("asw-filter")) {
                if (key === "contrast-cycle") {
                    filterButtons.forEach(button => {
                        if (button !== el) {
                            button.classList.remove("asw-selected");
                        }
                    });

                    const current = typeof userSettings.states.contrast === "string" ? userSettings.states.contrast : "contrast";
                    const nextValue = getNextContrastValue(current);

                    userSettings.states.contrast = nextValue === "contrast" ? false : nextValue;
                    updateContrastCycleButton(userSettings.states.contrast || "contrast");
                    enableContrast(userSettings.states.contrast);
                    saveUserSettings();
                    return;
                }

                filterButtons.forEach((filterBtn) => filterBtn.classList.remove("asw-selected"));

                if (isSelected) {
                    el.classList.add("asw-selected");
                }

                userSettings.states.contrast = isSelected ? key : false;
                updateContrastCycleButton(false);
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
