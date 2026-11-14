// PM2: mantiene la app prendida y la reinicia si se cae o si se reinicia el servidor.
// Uso: pm2 start deploy/ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: "automotoresaro",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname + "/..",
      // UNA sola instancia: los datos se guardan en archivos y los códigos de ingreso en memoria
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "600M",
      env: { NODE_ENV: "production", TZ: "America/Argentina/Rio_Gallegos" },
    },
  ],
};
