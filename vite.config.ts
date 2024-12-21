/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const isLibrary = process.env.BUILD_LIB === 'true'

function getLatestVersion() {
  try {
    const result = execSync('npm view @yonatankra/heart-component version').toString().trim();
    const [major, minor, patch] = result.split('.').map(Number);
    const updateType = process.env.UPDATE_TYPE || 'patch';

    switch (updateType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  } catch (error) {
    return '1.0.0';
  }
}

function generatePackageJson() {
  const version = getLatestVersion();
  const packageJson = {
    name: "@yonatan-kra/heart-component",
    version,
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

