/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path';
import fs from 'fs';

const isLibrary = process.env.BUILD_LIB === 'true'

function generatePackageJson() {
  const packageJson = {
    name: "@yonatankra/heart-component",
    version: "1.0.0",
    type: "module",
    files: ["./*.js"],
    main: "./heart.umd.js",
    module: "./heart.es.js",
    exports: {
      ".": {
        import: "./heart.es.js",
        require: "./heart.umd.js"
      }
    }
  }

  if (!fs.existsSync('./dist/heart')) {
    fs.mkdirSync('./dist/heart', { recursive: true })
  }
  fs.writeFileSync('./dist/heart/package.json', JSON.stringify(packageJson, null, 2))
}

export default defineConfig({
  root: './src',
  build: isLibrary ? {
    lib: {
      entry: resolve(__dirname, 'src/components/heart/heart.ts'),
      name: 'HeartComponent',
      fileName: (format) => `heart.${format}.js`,
      formats: ['es', 'umd'],
    },
    outDir: '../dist/heart',
    rollupOptions: {
      external: [], // Add external dependencies if any
      output: {
        globals: {} // Define globals for UMD build if needed
      },
      plugins: [{
        name: 'generate-package-json',
        closeBundle: generatePackageJson
      }]
    },    
    emptyOutDir: true,
    watch: null,
  } : {
    outDir: '../dist'
  },
  server: {
    open: true,
    host: '127.0.0.1'
  },
  test: {
    setupFiles: ['./setup.ts'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'cobertura'],
      reportsDirectory: '../coverage',
    },
  },
});