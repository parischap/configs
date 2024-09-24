import tsConfigSrc from "./tsconfig.src.js";

export default {
  ...tsConfigSrc,
  compilerOptions: {
    ...tsConfigSrc.compilerOptions,
    lib: ["ESNext"],
    types: ["node"],
  },
};
