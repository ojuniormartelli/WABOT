const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class DockerManager {
  constructor() {
    this.composePath = path.join(__dirname, 'docker-compose.yml');
    this.dataPath = path.join(__dirname, '..', 'data');
  }

  async getStatus() {
    const dockerInstalled = await this.checkDockerInstalled();
    if (!dockerInstalled) {
      return { dockerInstalled: false, evolutionRunning: false, whatsappConnected: false, error: null };
    }

    const evolutionRunning = await this.checkEvolutionRunning();
    const whatsappConnected = await this.checkWhatsappCredentials();

    return {
      dockerInstalled: true,
      evolutionRunning,
      whatsappConnected,
      error: null,
    };
  }

  checkDockerInstalled() {
    return new Promise((resolve) => {
      exec('docker --version', (error) => {
        resolve(!error);
      });
    });
  }

  checkEvolutionRunning() {
    return new Promise((resolve) => {
      exec('docker ps --filter name=wabot-evolution --format "{{.Names}}"', (error, stdout) => {
        if (error) return resolve(false);
        resolve(stdout.trim() === 'wabot-evolution');
      });
    });
  }

  checkWhatsappCredentials() {
    try {
      const credsPath = path.join(this.dataPath, 'credentials.json');
      if (!fs.existsSync(credsPath)) return false;
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
      return !!(creds.evolution?.instance_name);
    } catch {
      return false;
    }
  }

  startServices() {
    return new Promise((resolve, reject) => {
      const composeDir = path.dirname(this.composePath);
      exec(`docker compose -f "${this.composePath}" up -d`, { cwd: composeDir }, (error, stdout, stderr) => {
        if (error) return reject(new Error(stderr || error.message));
        resolve({ success: true, message: 'Serviços iniciados com sucesso' });
      });
    });
  }

  stopServices() {
    return new Promise((resolve, reject) => {
      const composeDir = path.dirname(this.composePath);
      exec(`docker compose -f "${this.composePath}" down`, { cwd: composeDir }, (error, stdout, stderr) => {
        if (error) return reject(new Error(stderr || error.message));
        resolve({ success: true, message: 'Serviços parados com sucesso' });
      });
    });
  }

  getLogs() {
    return new Promise((resolve) => {
      exec('docker logs wabot-evolution --tail 100', (error, stdout, stderr) => {
        if (error) return resolve({ error: error.message });
        const logs = { evolution: stdout + stderr };
        resolve({ success: true, logs });
      });
    });
  }
}

module.exports = { DockerManager };