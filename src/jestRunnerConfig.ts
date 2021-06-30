import * as vscode from 'vscode';
import { isWindows, normalizePath, quote, PredefinedVars } from './util';

export class JestRunnerConfig {
  /**
   * The command that runs jest.
   * Defaults to: node "node_modules/.bin/jest"
   */
  public static get jestCommand(): string {
    const cmd = vscode.workspace.getConfiguration().get<string>('playwrightrunner.jestCommand');
    if (cmd) {
      const editor = vscode.window.activeTextEditor;
      if(editor) {
        return (new PredefinedVars(editor.document.uri)).replace(cmd).trim();
      }
      return cmd;
    }

    if (this.isYarnPnpSupportEnabled) {
      return `yarn jest`;
    }
    return `node ${quote(this.jestBinPath)}`;
  }

  public static get jestBinPath(): string {
    const defaultPath = isWindows() ? './node_modules/jest/bin/jest.js' : './node_modules/.bin/jest';
    let playwrightPath = vscode.workspace.getConfiguration().get<string>('playwrightrunner.jestPath');
    const filepath = playwrightPath || defaultPath;
    
    const editor = vscode.window.activeTextEditor;
    if(editor) {
      return (new PredefinedVars(editor.document.uri)).replace(filepath).trim();
    }
    return filepath;
  }

  public static get projectPath(): string {
    const filepath = vscode.workspace.getConfiguration().get<string>('playwrightrunner.projectPath') || '${packageRoot}';
    const editor = vscode.window.activeTextEditor;
    if(editor) {
      return (new PredefinedVars(editor.document.uri)).replace(filepath).trim();
    }
    return filepath;
  }

  public static get jestConfigPath(): string | undefined {
    const filepath = vscode.workspace.getConfiguration().get<string>('playwrightrunner.jestConfigPath');
    if(!filepath) {return;}
    const editor = vscode.window.activeTextEditor;
    if(editor) {
      return (new PredefinedVars(editor.document.uri)).replace(filepath).trim();
    }
    return filepath;
  }

  public static get runOptions(): string[] {
    return vscode.workspace.getConfiguration().get<string[]>('playwrightrunner.jestRunOptions') || [];
  }

  public static get debugOptions(): Partial<vscode.DebugConfiguration> {
    const debugOptions = vscode.workspace.getConfiguration().get<Partial<vscode.DebugConfiguration>>('playwrightrunner.jestDebugOptions');
    return debugOptions || {};
  }

  public static get isYarnPnpSupportEnabled(): boolean {
    return Boolean(vscode.workspace.getConfiguration().get('playwrightrunner.enableYarnPnpSupport'));
  }

  public static get isCodeLensDisabled(): boolean {
    return Boolean(vscode.workspace.getConfiguration().get('playwrightrunner.disableCodeLens'));
  }

  public static get changeDirectoryToWorkspaceRoot(): boolean {
    return Boolean(vscode.workspace.getConfiguration().get<boolean>('playwrightrunner.changeDirectoryToWorkspaceRoot'));
  }
}
