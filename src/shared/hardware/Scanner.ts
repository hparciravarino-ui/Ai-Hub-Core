import si from 'systeminformation';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class Scanner {
  public static async scanSystem() {
    const [cpu, graphics, mem, os, diskLayout, fsSize, load, temp] = await Promise.all([
      si.cpu(),
      si.graphics(),
      si.mem(),
      si.osInfo(),
      si.diskLayout(),
      si.fsSize(), si.currentLoad(), si.cpuTemperature() ])

    return { cpu, graphics, mem, os, diskLayout, fsSize, load, temp };
  }

  public static async checkCommand(command: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(command);
      return stdout.trim().split('\n')[0];
    } catch (e) {
      return null;
    }
  }

  public static async scanRuntimes() {
    return {
      nodejs: await this.checkCommand('node -v'),
      python: await this.checkCommand('python --version') || await this.checkCommand('python3 --version'),
      docker: await this.checkCommand('docker -v'),
      git: await this.checkCommand('git --version'),
      vscode: await this.checkCommand('code -v'),
      firebase: await this.checkCommand('firebase -V'),
      gemini: await this.checkCommand('gemini -v'),
      ollama: await this.checkCommand('ollama -v'),
      lmStudio: await this.checkCommand('lms status'),
      vllm: await this.checkCommand('python -m vllm.entrypoints.openai.api_server --help') ? 'Installed' : null,
      llamaCpp: await this.checkCommand('llama-cli --help') ? 'Installed' : null,
      mlxLm: await this.checkCommand('python -c "import mlx" ') ? 'Installed' : null,
      localAi: await this.checkCommand('local-ai --version') || null
    };
  }
}
