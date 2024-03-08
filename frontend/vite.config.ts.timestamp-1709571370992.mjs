// vite.config.ts
import { defineConfig } from "file:///C:/Users/ccohn/source/repos/msrchat/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ccohn/source/repos/msrchat/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  build: {
    outDir: "../static",
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    proxy: {
      "/ask": "http://127.0.0.1:5000",
      "/chat": "http://127.0.0.1:5000",
      "/conversation": "http://127.0.0.1:5000",
      "/speech": "http://127.0.0.1:5000"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjY29oblxcXFxzb3VyY2VcXFxccmVwb3NcXFxcbXNyY2hhdFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcY2NvaG5cXFxcc291cmNlXFxcXHJlcG9zXFxcXG1zcmNoYXRcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2Njb2huL3NvdXJjZS9yZXBvcy9tc3JjaGF0L2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIG91dERpcjogXCIuLi9zdGF0aWNcIixcbiAgICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgICAgIHNvdXJjZW1hcDogdHJ1ZVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICBcIi9hc2tcIjogXCJodHRwOi8vMTI3LjAuMC4xOjUwMDBcIixcbiAgICAgICAgICAgIFwiL2NoYXRcIjogXCJodHRwOi8vMTI3LjAuMC4xOjUwMDBcIixcbiAgICAgICAgICAgIFwiL2NvbnZlcnNhdGlvblwiOiBcImh0dHA6Ly8xMjcuMC4wLjE6NTAwMFwiLFxuICAgICAgICAgICAgXCIvc3BlZWNoXCI6IFwiaHR0cDovLzEyNy4wLjAuMTo1MDAwXCIsXG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1UsU0FBUyxvQkFBb0I7QUFDalcsT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixPQUFPO0FBQUEsSUFDSCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsRUFDZjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsaUJBQWlCO0FBQUEsTUFDakIsV0FBVztBQUFBLElBQ2Y7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
