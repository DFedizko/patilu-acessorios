"use client";

import { useState } from "react";
import styles from "./animations.module.css";

export type ModalAnimation =
    | "fade"
    | "zoom"
    | "slide"
    | "slide-corner"
    | "flip-x"
    | "flip-y"
    | "rotate-in"
    | "bounce"
    | "swing"
    | "pop"
    | "blur-in"
    | "elastic"
    | "fold"
    | "glitch"
    | "drop"
    | "reveal"
    | "random";

export type ModalDirection =
    "top-left" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left";

const DIRECTIONAL_ANIMATIONS = new Set<ModalAnimation>(["slide", "slide-corner", "fold", "drop", "reveal"]);

const RANDOM_POOL: ModalAnimation[] = [
    "fade",
    "zoom",
    "slide",
    "slide-corner",
    "flip-x",
    "flip-y",
    "rotate-in",
    "bounce",
    "swing",
    "pop",
    "blur-in",
    "elastic",
    "fold",
    "glitch",
    "drop",
    "reveal",
];

const DIRECTION_POOL: ModalDirection[] = [
    "top-left",
    "top",
    "top-right",
    "right",
    "bottom-right",
    "bottom",
    "bottom-left",
    "left",
];

let counter = 0;

const DIRECTION_SUFFIX: Record<ModalDirection, string> = {
    "top-left": "TopLeft",
    top: "Top",
    "top-right": "TopRight",
    right: "Right",
    "bottom-right": "BottomRight",
    bottom: "Bottom",
    "bottom-left": "BottomLeft",
    left: "Left",
};

const CENTERED_KEY: Partial<Record<ModalAnimation, string>> = {
    fade: "fade",
    zoom: "zoom",
    "flip-x": "flipX",
    "flip-y": "flipY",
    "rotate-in": "rotateIn",
    bounce: "bounce",
    swing: "swing",
    pop: "pop",
    "blur-in": "blurIn",
    elastic: "elastic",
    glitch: "glitch",
};

const DIRECTIONAL_PREFIX: Partial<Record<ModalAnimation, string>> = {
    slide: "slide",
    "slide-corner": "slideCorner",
    fold: "fold",
    drop: "drop",
    reveal: "reveal",
};

const resolveKey = (animation: ModalAnimation, direction: ModalDirection): string => {
    if (!DIRECTIONAL_ANIMATIONS.has(animation)) {
        return CENTERED_KEY[animation] ?? "fade";
    }
    const prefix = DIRECTIONAL_PREFIX[animation] ?? "slide";
    return prefix + DIRECTION_SUFFIX[direction];
};

const lookupClass = (key: string): string => (styles as Record<string, string>)[key] ?? styles.fade;

const pickRandom = (direction: ModalDirection): string => {
    const idx = counter;
    counter++;
    const picked = RANDOM_POOL[idx % RANDOM_POOL.length];
    const isDirectional = DIRECTIONAL_ANIMATIONS.has(picked);
    const pickedDir = isDirectional ? DIRECTION_POOL[(idx * 3 + 7) % DIRECTION_POOL.length] : direction;
    return lookupClass(resolveKey(picked, pickedDir));
};

export const useModalAnimation = (animation: ModalAnimation = "fade", direction: ModalDirection = "bottom"): string => {
    const [randomClass] = useState<string>(() => (animation === "random" ? pickRandom(direction) : styles.fade));

    if (animation === "random") return randomClass;

    return lookupClass(resolveKey(animation, direction));
};
