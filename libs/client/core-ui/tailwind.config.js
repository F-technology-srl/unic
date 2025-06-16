const globalTailwindConf = require('../../../globals/tailwind-config.global');

const globalConf = globalTailwindConf(__dirname);

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...globalConf,
};
