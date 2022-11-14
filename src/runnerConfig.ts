import * as vscode from 'vscode';
import { PredefinedVars } from './util';

export class RunnerConfig {
  private base:vscode.Uri = vscode.Uri.file('.');
  constructor(base:vscode.Uri) {
    this.base = base;
  }

  public get projectPath(): string {
    const filepath = vscode.workspace.getConfiguration().get<string>('playwrightrunner.projectPath') || '';
    return (new PredefinedVars(this.base)).replace(filepath).trim();
    return filepath;
  }

  public static get isCodeLensDisabled(): boolean {
    return Boolean(vscode.workspace.getConfiguration().get('playwrightrunner.disableCodeLens'));
  }

  public static get changeDirectoryToWorkspaceRoot(): boolean {
    return Boolean(vscode.workspace.getConfiguration().get<boolean>('playwrightrunner.changeDirectoryToWorkspaceRoot'));
  }

  /**
   * The command that runs playwright.
   * Defaults to: node "node_modules/.bin/playwright"
   */
   public get playwrightCommand(): string {
    const cmd = vscode.workspace.getConfiguration().get<string>('playwrightrunner.playwrightCommand');
    if (cmd) {
      return (new PredefinedVars(this.base)).replace(cmd).trim();
    }
    return 'npx playwright';
  }

  public get playwrightConfigPath(): string | undefined {
    const filepath = vscode.workspace.getConfiguration().get<string>('playwrightrunner.playwrightConfigPath');
    if(!filepath) {return;}
    return (new PredefinedVars(this.base)).replace(filepath).trim();
  }

  public get playwrightRunProject(): string | undefined {
    const project = vscode.workspace.getConfiguration().get<string>('playwrightrunner.playwrightRunProject');
    if(!project || 0 === project.length) {return '';}
    return (new PredefinedVars(this.base)).replace(project).trim();
  }

  public get playwrightDebugProject(): string | undefined {
    const project = vscode.workspace.getConfiguration().get<string>('playwrightrunner.playwrightDebugProject');
    if(!project || 0 === project.length) {return '';}
    return (new PredefinedVars(this.base)).replace(project).trim();
  }

  public get playwrightInspectProject(): string | undefined {
    const project = vscode.workspace.getConfiguration().get<string>('playwrightrunner.playwrightInspectProject');
    if(!project || 0 === project.length) {return '';}
    return (new PredefinedVars(this.base)).replace(project).trim();
  }

  public get playwrightRunOptions(): string[] {
    return vscode.workspace.getConfiguration().get<string[]>('playwrightrunner.playwrightRunOptions') || [];
  }

  public get playwrightEnvironmentVariables(): { [key:string]: string; } {
    const data:string[] = vscode.workspace.getConfiguration().get<string[]>('playwrightrunner.playwrightEnvironmentVariables') || [];
    const envs:{ [key:string]: string; } = {};
    data.forEach(env => {
      const [key,val] = env.split('=');
      envs[key] = val;
    });
    return envs;
  }


}
