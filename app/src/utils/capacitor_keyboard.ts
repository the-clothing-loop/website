import { Capacitor } from "@capacitor/core";

export default async function getKeyboard() {
  if (Capacitor.isPluginAvailable("Keyboard") && !window.Keyboard) {
    window.Keyboard = (await import("@capacitor/keyboard")).Keyboard;
  }
}
