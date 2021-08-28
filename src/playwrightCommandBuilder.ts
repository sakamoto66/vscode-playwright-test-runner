import * as path from 'path';
import * as vscode from 'vscode';
import { RunnerConfig } from './runnerConfig';
import { escapeRegExpForPath, escapeRegExp, normalizePath, pushMany, escapeShell } from './util';
const merge = require('deepmerge');

export class PlaywrightCommandBuilder {
  public static getDebugConfig(filePath: vscode.Uri, currentTestName?: string, options?: unknown): vscode.DebugConfiguration {
    const config = new RunnerConfig(filePath);
    const debugCfg: vscode.DebugConfiguration = {
      console: 'internalConsole',
      internalConsoleOptions: "openOnSessionStart",
      outputCapture: "std",
      name: 'playwright',
      request: 'launch',
      type: 'pwa-node',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      env: { PWDEBUG: 'console' }
    };
    if(RunnerConfig.changeDirectoryToWorkspaceRoot) {
      debugCfg.cwd = config.projectPath;
    }

    // setting execute command
    let cmds = config.playwrightCommand.split(/\s+/);
    const executer = cmds.shift();
    if(['npx', 'yarn'].includes(executer||'')) {
      debugCfg.runtimeExecutable = executer;
      debugCfg.runtimeArgs = cmds;
      cmds = [];
    } else {
      debugCfg.program = executer;
    }

    // setting args of execute command
    debugCfg.args = [...cmds, ...this.buildArgs(config, filePath, currentTestName, false)];
    
    // setting envs
    debugCfg.env = merge(debugCfg.env, config.playwrightEnvironmentVariables);
    
    //
    return options ? merge(debugCfg, options) : debugCfg;
  }

  public static getTerminalOptions(filePath: vscode.Uri): vscode.TerminalOptions {
    const config = new RunnerConfig(filePath);
    return {
      name:'playwright',
      env:config.playwrightEnvironmentVariables,
      cwd:RunnerConfig.changeDirectoryToWorkspaceRoot ? config.projectPath : undefined
    };
  }

  public static buildCommand(filePath: vscode.Uri, testName?: string, options?: string[]): string {
    const config = new RunnerConfig(filePath);
    const args = this.buildArgs(config, filePath, testName, true, options);
    return `${config.playwrightCommand} ${args.join(' ')}`;
  }
  
  public static buildShowTraceCommand(filePath: vscode.Uri): string {
    const config = new RunnerConfig(filePath);
    const args: string[] = [];
    args.push('show-trace');
    args.push(escapeShell(escapeRegExpForPath(normalizePath(filePath.fsPath))));
    return `${config.playwrightCommand} ${args.join(' ')}`;
  }
  
  public static buildCodeGenCommand(filePath: vscode.Uri): string {
    const config = new RunnerConfig(filePath);
    const args: string[] = [];
    args.push('codegen');
    args.push('-o');
    args.push(escapeShell(escapeRegExpForPath(normalizePath(filePath.fsPath))));
    return `${config.playwrightCommand} ${args.join(' ')}`;
  }

  private static buildArgs(config:RunnerConfig, filePath: vscode.Uri, testName?: string, withQuotes?: boolean, options: string[] = []): string[] {
    const args: string[] = [];
    const quoter = withQuotes ? escapeShell : (str:string) => str;

    args.push('test');

    const testfile = path.basename(filePath.fsPath);

    args.push(quoter(escapeRegExpForPath(normalizePath(testfile))));

    const cfg = config.playwrightConfigPath;
    if (cfg) {
      args.push('-c');
      args.push(quoter(normalizePath(cfg)));
    }

    if (testName) {
      args.push('-g');
      args.push(withQuotes ? `"${testName}"` : testName);
    }

    const setOptions = new Set(options);

    if (config.playwrightRunOptions) {
      config.playwrightRunOptions.forEach((option) => setOptions.add(option));
    }

    args.push(...setOptions);

    return args;
  }
}
