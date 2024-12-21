/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path';
import fs from 'fs';

const isLibrary = process.env.BUILD_LIB === 'true'

function getPackageJSON(filePath) {
  return JSON.parse(fs.readFileSync(resolve(filePath), 'utf-8'));
}

function getLatestVersion(packageJson) {
  try {
    if (packageJson.version) {
      const [major, minor, patch] = packageJson.version.split('.').map(Number);
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
    } else {
      return '1.0.0';
    }
  } catch (error) {
    return '1.0.0';
  }
}

function generatePackageJson() {
  try {
    const packageJson = getPackageJSON('./src/components/heart/package.json');
    packageJson.version = getLatestVersion(packageJson);

    if (!fs.existsSync('./dist/heart')) {
      fs.mkdirSync('./dist/heart', { recursive: true })
    }
    fs.writeFileSync('./dist/heart/package.json', JSON.stringify(packageJson, null, 2))
  } catch (error) {
    console.error(error);
  }
}

function copyReadme() {
  console.log('Readme copy');
  try {
    // Move README.md
    const readmeSrc = './src/components/heart/README.md';
    const readmeDest = './dist/heart/README.md';
    if (fs.existsSync(readmeSrc)) {
      fs.copyFileSync(readmeSrc, readmeDest);
    }
  } catch (error) {
    console.error(error);
  }
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
      },
      {
        name: 'move-readme',
        closeBundle: copyReadme
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

