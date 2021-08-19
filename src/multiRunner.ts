import * as vscode from 'vscode';
import { escapeShell, getEnvCommands } from './util';
import { RunnerConfig } from './runnerConfig';
import { TestCase } from './testCase';

interface RunCommand {
  terminal:string,
  commands: string[];
}
interface DebugCommand {
  documentUri: vscode.Uri;
  config: vscode.DebugConfiguration;
}

export class MultiRunner {
  private previousRunCommand: RunCommand | undefined;
  private previousDebugCommand: DebugCommand | undefined;

  constructor() {
  }

  public async runTest(testcase:TestCase, options?: string[]): Promise<void> {
    const config = new RunnerConfig(testcase.filePath);
    const cmds = [];
    // cwd
    RunnerConfig.changeDirectoryToWorkspaceRoot && cmds.push(`cd ${escapeShell(config.projectPath)}`);
    // setting envs
    const envs = getEnvCommands(config.playwrightEnvironmentVariables);

    cmds.push(...envs);
    cmds.push(testcase.buildRunCommand(options));

    await this.executeRunCommand({
      terminal: 'playwright',
      commands: cmds,
    });
  }

  public async debugTest(testcase:TestCase, options?: unknown): Promise<void> {
    let debugConfig = testcase.buildDebugCommand(options);
    await this.executeDebugCommand({
      config: debugConfig,
      documentUri: testcase.filePath,
    });
  }
  
  public async runPreviousTest(): Promise<void> {
    if (this.previousRunCommand) {
      await this.executeRunCommand(this.previousRunCommand);
      return;
    }

    if (this.previousDebugCommand) {
      await this.executeDebugCommand(this.previousDebugCommand);
      return;
    }
    throw new Error('not found prev test');
  }

  //
  // private methods
  //

  private async executeRunCommand(cmd: RunCommand) {
    this.previousRunCommand = cmd;
    this.previousDebugCommand = undefined;

    await this.runTerminalCommand(cmd.terminal, ...cmd.commands);
  }

  private async executeDebugCommand(cmd: DebugCommand) {
    this.previousRunCommand = undefined;
    this.previousDebugCommand = cmd;

    await vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cmd.documentUri), cmd.config);
  }

  public async runTerminalCommand(terminalName:string, ...commands: string[]) {
    let terminal = vscode.window.terminals.find(terminal => terminal.name === terminalName);
    if (!terminal) {
      terminal = vscode.window.createTerminal(terminalName);
    }
    terminal.show();
    commands.forEach( command => terminal?.sendText(command) );
  }
}
