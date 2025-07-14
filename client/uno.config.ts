// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons()
  ],
  content: {
    pipeline: {
      include: ['./src/**/*.{ts,tsx,js,jsx,html}'],
    },
  },
});
