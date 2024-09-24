import tsConfigSrc from "./tsconfig.src.js";

export default {
  ...tsConfigSrc,
  compilerOptions: {
    ...tsConfigSrc.compilerOptions,
    lib: ["ESNext", "DOM", "DOM.Iterable"],
  },
};
