const {
  createGlobPatternsForDependencies,
} = require('@nxtensions/astro/tailwind');

const { join } = require('path');

function globalTailwindConf(dirName) {
  return {
    content: [
      join(
        dirName,
        '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html,astro}',
      ),
      'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
      'node_modules/flowbite/**/*.js',
      ...createGlobPatternsForDependencies(dirName),
    ],
    theme: {
      extend: {
        colors: {
          'blue-800': '#1E429F',
          'gray-50': '#F9FAFB',
          'gray-100': '#F3F4F6',
          'gray-200': '#E5E7EB',
          'gray-700': '#374151',
          'gray-900': '#111928',
        },
        boxShadow: {
          'custom-shadow':
            '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px -1px rgba(0, 0, 0, 0.10)',
          'custom-shadow-table': '0px 1px 2px 0px rgba(0, 0, 0, 0.08)',
          'custom-shadow-dropdown':
            '1px 1px 3px 2px #0000001A, 0px 1px 2px -1px #0000001A',
        },
      },
    },
    plugins: [require('flowbite/plugin')],
  };
}

module.exports = globalTailwindConf;
