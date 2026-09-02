// src/vite-env.d.ts or src/global.d.ts

/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.svg";
