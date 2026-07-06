// src/vite-env.d.ts or src/global.d.ts

/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

// If you have other assets:
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.svg";
