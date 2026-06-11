#!/usr/bin/env node

const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: run-with-java21 <command> [...args]');
  process.exit(1);
}

const env = { ...process.env };
const java21Home = resolveJava21Home();

if (java21Home) {
  env.JAVA_HOME = java21Home;
  const binDir = path.join(java21Home, 'bin');
  env.PATH = env.PATH ? `${binDir}:${env.PATH}` : binDir;
}

const child = spawn(command, args, {
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

function resolveJava21Home() {
  if (getJavaMajor(process.env.JAVA_HOME) === 21) {
    return process.env.JAVA_HOME;
  }

  if (process.platform === 'darwin') {
    const macHome = runCommand('/usr/libexec/java_home', ['-v', '21']);
    if (macHome) {
      return macHome;
    }
  }

  return process.env.JAVA_HOME;
}

function getJavaMajor(javaHome) {
  const javaBinary = javaHome ? path.join(javaHome, 'bin', 'java') : 'java';
  const output = runCommand(javaBinary, ['-version'], true);

  if (!output) {
    return null;
  }

  const match = output.match(/version "(\d+)(?:\.(\d+))?/);
  if (!match) {
    return null;
  }

  if (match[1] === '1' && match[2]) {
    return Number(match[2]);
  }

  return Number(match[1]);
}

function runCommand(commandName, commandArgs, readStderr = false) {
  const result = spawnSync(commandName, commandArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    return null;
  }

  const output = readStderr ? result.stderr : result.stdout;
  return output.trim() || null;
}