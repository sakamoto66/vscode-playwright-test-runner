import * as vscode from 'vscode';
import { TestCase, RunCommand, DebugCommand } from './testCase';

export class MultiRunner {
  private previousRunCommand: RunCommand | undefined;
  private previousDebugCommand: DebugCommand | undefined;

  public async runTest(testcase:TestCase, options?: string[]): Promise<void> {
    const cmd = testcase.buildRunCommand(options);
    await this.executeRunCommand(cmd);
  }

  public async debugTest(testcase:TestCase, options?: unknown): Promise<void> {
    const cmd = testcase.buildDebugCommand(options);
    await this.executeDebugCommand(cmd);
  }
  
  public async inspectTest(testcase:TestCase): Promise<void> {
    const cmd = testcase.buildInspectCommand();
    await this.executeRunCommand(cmd);
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

    await MultiRunner.startTerminal(cmd.options, cmd.command);
  }

  private async executeDebugCommand(cmd: DebugCommand) {
    this.previousRunCommand = undefined;
    this.previousDebugCommand = cmd;

    await vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cmd.documentUri), cmd.config);
  }

  private static async startTerminal(options:vscode.TerminalOptions, ...commands: string[]) {
    let terminal = vscode.window.terminals.find(terminal => terminal.name === options.name);
    if (!terminal) {
      terminal = vscode.window.createTerminal(options);
    }
    terminal.show();
    commands.forEach( command => terminal?.sendText(command) );
  }
}
