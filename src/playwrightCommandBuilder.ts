import * as path from 'path';
import * as vscode from 'vscode';
import { RunnerConfig as config} from './runnerConfig';
import { escapeRegExpForPath, escapeSingleQuotes, normalizePath, pushMany, quote } from './util';
//import { merge } from 'merge-deep';
export class PlaywrightCommandBuilder {
  public getCwd(): string {
    return config.projectPath;
  }

  public getDebugConfig(filePath: string, currentTestName?: string, options?: unknown): vscode.DebugConfiguration {
    const debugCfg: vscode.DebugConfiguration = {
      console: 'integratedTerminal',
      internalConsoleOptions: 'neverOpen',
      name: 'playwright(debug)',
      program: config.playwrightBinPath,
      request: 'launch',
      type: 'node',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      env: { PWDEBUG: 'console' },
      cwd: config.projectPath,
      ...config.playwrightDebugOptions,
    };

    debugCfg.args = debugCfg.args ? debugCfg.args.slice() : [];

    const standardArgs = this.buildArgs(filePath, currentTestName, false);
    pushMany(debugCfg.args, standardArgs);
    //merge(config, options);

    return debugCfg;
  }

  public buildCommand(filePath: string, testName?: string, options?: string[]): string {
    const args = this.buildArgs(filePath, testName, true, options);
    return `${config.playwrightCommand} ${args.join(' ')}`;
  }

  private buildArgs(filePath: string, testName?: string, withQuotes?: boolean, options: string[] = []): string[] {
    const args: string[] = [];
    const quoter = withQuotes ? quote : (str:string) => str;

    args.push('test');

    const cwd = vscode.Uri.file(config.projectPath);
    const testfile = path.relative(cwd.fsPath + '/tests', filePath).replace(/\\/g, '/');

    args.push(quoter(escapeRegExpForPath(normalizePath(testfile))));

    const cfg = config.playwrightConfigPath;
    if (cfg) {
      args.push('--config=');
      args.push(quoter(normalizePath(cfg)));
    }

    if (testName) {
      args.push('-g');
      args.push(quoter(escapeSingleQuotes(testName)));
    }

    const setOptions = new Set(options);

    if (config.playwrightRunOptions) {
      config.playwrightRunOptions.forEach((option) => setOptions.add(option));
    }

    args.push(...setOptions);

    return args;
  }
}
