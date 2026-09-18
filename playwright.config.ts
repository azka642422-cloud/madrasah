import{defineConfig}from'@playwright/test';
export default defineConfig({testDir:'./tests/browser',fullyParallel:false,retries:0,use:{baseURL:'http://127.0.0.1:4173'},webServer:{command:'npm run build:frontend && npm --workspace frontend exec vite -- preview --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:120000}});
