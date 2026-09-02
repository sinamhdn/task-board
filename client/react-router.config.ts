import { type Config } from "@react-router/dev/config";

export default {
  appDirectory: "app", // Tells React Router to look for root.tsx in src/
  ssr:true,
} satisfies Config;