// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/#configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    src: "/",
  },
  plugins: ["@snowpack/plugin-postcss"],
  buildOptions: {
    out: 'custom_output_directory_name',
  },
  // installOptions: {},
  // devOptions: {},
  // buildOptions: {},
};