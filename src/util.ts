import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as child_process from "child_process";

export function isWindows(): boolean {
  return process.platform.includes('win32');
}

function getShellType(): string {
  if(isWindows()) {
    const shell:any = vscode.workspace.getConfiguration().get('terminal.integrated.shell');
    if(shell.windows){
      return shell.windows.split('.')[0];
    }
    const defaultProfile:any = vscode.workspace.getConfiguration().get('terminal.integrated.defaultProfile');
    if(defaultProfile.windows){
      switch(defaultProfile.windows){
        case 'PowerShell':return 'powershell';
        case 'Command Prompt':return 'cmd';
        default:return 'sh';
      }
    }
    return 'powershell';
  }
  return 'sh';
}

export function normalizePath(path: string): string {
  return isWindows() ? path.replace(/\\/g, '/') : path;
}

export function escapeRegExp(s: string): string {
  const escapedString = s.replace(/[.*+?^${}<>()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  return escapedString.replace(/\\\(\\\.\\\*\\\?\\\)/g, '(.*?)'); // should revert the escaping of match all regex patterns.
}

export function escapeRegExpForPath(s: string): string {
  return s.replace(/[*+?^${}<>()|[\]]/g, '\\$&'); // $& means the whole matched string
}

export function resolveTestNameStringInterpolation(s: string): string {
  return s.replace(/[.*+?()[\]\\]/g, '\\$&')
    .replace(/\${[A-Za-z0-9_]+}/gi, '(.*?)')
    .replace(/\s+/g, '\\s+')
    .replace(/["$^<>|]/g, '\\S');
}

const QUOTES = ['"',"'",'`'];

export function exactRegexMatch(s: string): string {
  return ['^', s, '$'].join('');
}

export function escapeSingleQuotes(s: string): string {
  return isWindows() ? s : s.replace(/'/g, "'\\''");
}

export function escapeShell(cmd:string) {
  return '"'+cmd.replace(/(["'$`\\])/g,'\\$1')+'"';
};

export function unquote(s: string): string {
  if (-1 < QUOTES.indexOf(s[0])) {
    s = s.substring(1);
  }

  if (-1 < QUOTES.indexOf(s[s.length - 1])) {
    s = s.substring(0, s.length - 1);
  }

  return s;
}

export function pushMany<T>(arr: T[], items: T[]): number {
  return Array.prototype.push.apply(arr, items);
}

export function escapePlusSign(s: string): string {
  return s.replace(/[+]/g, '\\$&');
}
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): unknown {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: any, ...sources: any): unknown {
  if (!sources.length) {return target;}
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {Object.assign(target, { [key]: {} });}
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
}

function getWorkspaceRoot(current:vscode.Uri | undefined): string | undefined {
  if(current){
    const folder = vscode.workspace.getWorkspaceFolder(current);
    return folder && folder.uri.fsPath;
  }

  let rootDir:vscode.Uri; 
  const folders = vscode.workspace.workspaceFolders;
  if(undefined !== folders && 0 < folders.length){
    return folders[0] && folders[0].uri.fsPath;
  }
  return undefined;
}

function getPackageRoot(current:vscode.Uri | undefined) {
  const workspace = getWorkspaceRoot(current);
  if(current) {
    let currentFolderPath: string = path.dirname(current.fsPath);
    do {
      // such as in multi-module projects.
      const pkg = path.join(currentFolderPath, 'package.json');
      const mdls = path.join(currentFolderPath, 'node_modules');
      if (fs.existsSync(pkg) && fs.existsSync(mdls)) {
        return currentFolderPath;
      }
      currentFolderPath = path.join(currentFolderPath, '..');
    } while (currentFolderPath !== workspace);
  }
  return workspace;
}
export class PredefinedVars {
  private replaceMap:Map<string, string> = new Map();

  public constructor(current:vscode.Uri){
      this.replaceMap = new Map();
      const currPath = current && current.fsPath;

      this.set("workspaceRoot", getWorkspaceRoot(current) || '');
      this.set("packageRoot", getPackageRoot(current) || '');
      
      if(currPath) {
          this.set("currentFile", currPath);
          this.set("fileExtname", path.extname(currPath));
          this.set("fileBasenameNoExtension" ,path.basename(currPath, this.replaceMap.get("${fileExtname}")));
          this.set("fileBasename", path.basename(currPath));
          this.set("fileDirname", path.dirname(currPath));
      }
  }
  
  public replace(str:String) {
      this.replaceMap.forEach( (val, key) =>{
          str = str.replace(key, val);
      });
      // User may be input a path with backward slashes (\), so need to replace all '\' to '/'.
      return str.replace(/\\/g, '/');
  }

  public set(key:string, val:string){
      this.replaceMap.set("${"+key+"}", val);
  }
}
  
export async function executeBackend(cmd:string): Promise<void> {
  vscode.window.showInformationMessage(cmd);
  child_process.exec(cmd, (error, stdout, stderr) => {
    if(error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    } 
  });
}
