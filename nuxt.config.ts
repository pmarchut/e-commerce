import { defineNuxtConfig } from 'nuxt/config'

requireEnvVars();

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ["@/assets/main.css", "@formkit/themes/genesis"],
  modules: [
    "@formkit/nuxt",
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "acceptHMRUpdate"],
      },
    ],
    "@nuxtjs/supabase",
    '@nuxt/test-utils/module'
  ],
  runtimeConfig: {
    stripeSecret: process.env.STRIPE_SECRET,
    public: {
      contentfulSpace: process.env.NUXT_CONTENTFUL_SPACE,
      contentfulPublicAccessToken: process.env.NUXT_CONTENTFUL_PUBLIC_ACCESS_TOKEN,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_KEY,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  supabase: {
    redirect: false
  },
  build: {
    transpile:
      process.env.npm_lifecycle_script === "nuxt generate"
        ? ["contentful"]
        : [],
  },
});

function requireEnvVars() {
  const map: Record<string, string | undefined> = {
    "Supabase Project URL": process.env.SUPABASE_URL,
    "Supabase Project API Key": process.env.SUPABASE_KEY,
    "Stripe secret token": process.env.STRIPE_SECRET,
  };

  let ready = true;
  for (const label in map) {
    if (!map[label]) {
      ready = false;
      console.error(
        `You must provide a ${label} in .env to start the project (see the Setup Guide for more instructions: https://vueschool.notion.site/Preparation-Guide-cf256a7352704d27bb7946c47907d40e)`
      );
    }
  }

  if (!ready) process.exit();
}
