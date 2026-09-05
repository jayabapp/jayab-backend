const { spawn } = require("node:child_process");
const { join } = require("node:path");

const nestCli = join(
  process.cwd(),
  "node_modules",
  "@nestjs",
  "cli",
  "bin",
  "nest.js",
);

const child = spawn(process.execPath, [nestCli, "start", "--watch"], {
  env: {
    ...process.env,
    PWD: process.env.PWD || process.cwd(),
    TZ: "Asia/Tehran",
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
