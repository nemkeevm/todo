export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  typescript: { strict: true },
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Todo',
      meta: [{ name: 'description', content: 'Заметки и задачи без лишнего.' }],
    },
  },
})
