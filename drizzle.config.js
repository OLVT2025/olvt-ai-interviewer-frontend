/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://neondb_owner:npg_1bBviLGrI6kc@ep-quiet-sky-a8106jyg-pooler.eastus2.azure.neon.tech/ai-interviewer?sslmode=require',
    }
};