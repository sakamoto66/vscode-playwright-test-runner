'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MultiRunner } from './multiRunner';
import { TestCase } from './testCase';
import { PlaywrightRunnerCodeLensProvider } from './codeLensProvider';
import { RunnerConfig as config } from './runnerConfig';
import { TestReporter } from './testReporter';
import { PlaywrightCommandBuilder } from './playwrightCommandBuilder';
import { executeBackend } from './util';

export function activate(context: vscode.ExtensionContext): void {
  const multiRunner = new MultiRunner();
  const codeLensProvider = new PlaywrightRunnerCodeLensProvider();
  const testReporter = new TestReporter(context);

  //現在の編集中のテストを関数単位で実行する
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.runTest',
    (testname: Record<string, unknown> | string | undefined) => {
      testname = typeof testname === 'string' ? testname : undefined;
      TestCase.toEditor(testname).then( testcase => {
        multiRunner.runTest(testcase);
      });
    }
  ));
  //
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.debugTest',
    (testname: Record<string, unknown> | string | undefined) => {
      testname = typeof testname === 'string' ? testname : undefined;
      TestCase.toEditor(testname).then( testcase => {
        multiRunner.debugTest(testcase);
      });
    }
  ));
  //インスペクションを実行する
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.inspectTest',
    (testname: Record<string, unknown> | string | undefined) => {
      testname = typeof testname === 'string' ? testname : undefined;
      TestCase.toEditor(testname).then( testcase => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        multiRunner.inspectTest(testcase);
      });
    }
  ));

  //現在の編集中のテストをファイル単位で実行する
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.runCurrentFile',
    () => {
      TestCase.toEditor('-').then( testcase => {
        testcase.testName = undefined;
        multiRunner.runTest(testcase);
      });
    }
  ));
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.debugCurrentFile',
    () => {
      TestCase.toEditor('-').then( testcase => {
        testcase.testName = undefined;
        multiRunner.debugTest(testcase);
      });
    }
  ));

  //指定したファイルをテスト実行する
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.runTestPath',
    (file: vscode.Uri) => {
      const testcase = TestCase.toFile(file);
      multiRunner.runTest(testcase);
    }
  ));
  //
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.debugTestPath',
    (file: vscode.Uri) => {
      const testcase = TestCase.toFile(file);
      multiRunner.debugTest(testcase);
    }
  ));

  //スナップショットを更新する
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.runTestAndUpdateSnapshots',
    () => {
      TestCase.toEditor('-').then( testcase => {
        testcase.testName = undefined;
        multiRunner.runTest(testcase, ['-u']);
      });
    }
  ));

  //テストを再実行する
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.runPrevTest',
    () => {
      multiRunner.runPreviousTest();
    }
  ));
  //カバレッジをとる
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.runCurrentFileWithCoverage',
    () => {
      TestCase.toEditor('-').then( testcase => {
        testcase.testName = undefined;
        multiRunner.runTest(testcase, ['--coverage']);
      });
    }
  ));
  //show test report
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.showTestReport',
    (uri:vscode.Uri) => {
      testReporter.update(uri);
  }));
  //show trace
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.showTrace',
    (uri:vscode.Uri) => {
      const cmd = PlaywrightCommandBuilder.buildShowTraceCommand(uri);
      executeBackend(cmd);
    }));
  //generate code
  context.subscriptions.push(vscode.commands.registerCommand(
    'playwright.codeGen',
    (uri:vscode.Uri) => {
      const outputPath:string = uri.fsPath;
      inputTestFileBox(outputPath).then( inputVal => {
        if(!inputVal) {
          return;
        }
        const uri = vscode.Uri.file(path.join(outputPath, inputVal)); 
        const cmd = PlaywrightCommandBuilder.buildCodeGenCommand(uri);
        executeBackend(cmd);
      });
  }));
  
  if (!config.isCodeLensDisabled) {
    const docSelectors: vscode.DocumentFilter[] = [
      { pattern: vscode.workspace.getConfiguration().get('playwrightrunner.codeLensSelector') },
    ];
    const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(docSelectors, codeLensProvider);
    context.subscriptions.push(codeLensProviderDisposable);
  }
}

export function deactivate(): void {
  // deactivate
}

async function inputTestFileBox(outputPath:string):Promise<string|undefined> {
  let finame:string = "sample.spec.ts";
  let cnt = 0;
  while (fs.existsSync(path.join(outputPath, finame))) {
    finame = `sample${++cnt}.spec.ts`;
  }
  const options: vscode.InputBoxOptions = {
      prompt: "input filename to generate playwright test code.",
      value: finame,
      placeHolder: "(e.g:sample.spec.ts)",
      valueSelection: [0, finame.split('.')[0].length],
  };
  return vscode.window.showInputBox(options);
}