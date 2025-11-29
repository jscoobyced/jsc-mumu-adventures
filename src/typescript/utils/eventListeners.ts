import { Keys } from "../models/Keys";

// Declare global variables (these should be defined elsewhere in your project)
let keys!: Keys;

export const getKeys = (): Keys => keys;
export let lastTime: number = performance.now();
export const getLastTime = (): number => lastTime;
export const setLastTime = (time: number): void => {
  lastTime = time;
};

const initializeKeys = (): void => {
  keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
  };
};

initializeKeys();

export const initializeEventListeners = (): void => {
  window.addEventListener("keydown", (event: KeyboardEvent): void => {
    switch (event.key) {
      case "w":
        keys.w.pressed = true;
        break;
      case "a":
        keys.a.pressed = true;
        break;
      case "s":
        keys.s.pressed = true;
        break;
      case "d":
        keys.d.pressed = true;
        break;
    }
  });

  window.addEventListener("keyup", (event: KeyboardEvent): void => {
    switch (event.key) {
      case "w":
        keys.w.pressed = false;
        break;
      case "a":
        keys.a.pressed = false;
        break;
      case "s":
        keys.s.pressed = false;
        break;
      case "d":
        keys.d.pressed = false;
        break;
    }
  });

  // On return to game's tab, ensure delta time is reset
  document.addEventListener("visibilitychange", (): void => {
    if (!document.hidden) {
      lastTime = performance.now();
    }
  });
};
