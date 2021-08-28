import * as path from 'path';
import * as assert from 'assert';

import * as vscode from 'vscode';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { PlaywrightCommandBuilder } from '../../playwrightCommandBuilder';

describe('playwrightCommandBuilder', () => {
	vscode.window.showInformationMessage('Start config tests.');
	const conf = vscode.workspace.getConfiguration('playwrightrunner');
	let rootDir:vscode.Uri = vscode.Uri.file('.'); 
	if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
		rootDir = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri;
	}
	const assetRootDir = rootDir.fsPath.replace(/\\/g, '/');
	const command = 'sample abc';
	const file = vscode.Uri.joinPath(rootDir, "tests/mainpackage.spec.js");
	const file2 = vscode.Uri.joinPath(rootDir, "packages/subpackage/tests/subpackage.spec.js");

	describe('buildCommand', () => {
		beforeEach( async () => {
			await conf.update('playwrightCommand', command);
			await conf.update('playwrightConfigPath', undefined);
			await vscode.workspace.openTextDocument(file).then(doc => vscode.window.showTextDocument(doc));
		});
	
		afterEach( async () => {
			await conf.update('playwrightCommand', undefined);
			await conf.update('playwrightConfigPath', undefined);
		});
		
		it('test 1', async () => {
			const cmd = PlaywrightCommandBuilder.buildCommand(file);
			assert.deepStrictEqual(`${command} test "mainpackage.spec.js"`, cmd);
		});	

		it('test 2', async () => {
			const cmd = PlaywrightCommandBuilder.buildCommand(file, 'testcase');
			assert.deepStrictEqual(`${command} test "mainpackage.spec.js" -g "testcase"`, cmd);
		});	

		it('test 3', async () => {
			const cmd = PlaywrightCommandBuilder.buildCommand(file, 'testcase', ['--a','--b']);
			assert.deepStrictEqual(`${command} test "mainpackage.spec.js" -g "testcase" --a --b`, cmd);
		});	

		it('test 4', async () => {
			await conf.update('playwrightConfigPath', 'playwright.config.js');
			const cmd = PlaywrightCommandBuilder.buildCommand(file, 'testcase');
			assert.deepStrictEqual(`${command} test "mainpackage.spec.js" -c "playwright.config.js" -g "testcase"`, cmd);
			await conf.update('playwrightConfigPath', undefined);
		});	
	});

	describe('buildShowTraceCommand', () => {
		const file = vscode.Uri.joinPath(rootDir, "trace.zip");
	
		afterEach( async () => {
			await conf.update('playwrightCommand', undefined);
			await conf.update('playwrightConfigPath', undefined);
		});

		it('test 1', async () => {
			await conf.update('playwrightCommand', undefined);
			const cmd = PlaywrightCommandBuilder.buildShowTraceCommand(file);
			assert.deepStrictEqual(`npx playwright show-trace "${file.fsPath.replace(/\\/g,'/')}"`, cmd);
		});	

		it('test 2', async () => {
			await conf.update('playwrightCommand', command);
			const cmd = PlaywrightCommandBuilder.buildShowTraceCommand(file);
			assert.deepStrictEqual(`${command} show-trace "${file.fsPath.replace(/\\/g,'/')}"`, cmd);
		});	
	});

	describe('buildCodeGenCommand', () => {
		const file = vscode.Uri.joinPath(rootDir, "test.spac.ts");
	
		afterEach( async () => {
			await conf.update('playwrightCommand', undefined);
			await conf.update('playwrightConfigPath', undefined);
		});

		it('test 1', async () => {
			await conf.update('playwrightCommand', undefined);
			const cmd = PlaywrightCommandBuilder.buildCodeGenCommand(file);
			assert.deepStrictEqual(`npx playwright codegen -o "${file.fsPath.replace(/\\/g,'/')}"`, cmd);
		});	

		it('test 2', async () => {
			await conf.update('playwrightCommand', command);
			const cmd = PlaywrightCommandBuilder.buildCodeGenCommand(file);
			assert.deepStrictEqual(`${command} codegen -o "${file.fsPath.replace(/\\/g,'/')}"`, cmd);
		});	
	});
	
	describe('getDebugConfig', () => {
		beforeEach( async () => {
			await conf.update('playwrightCommand', command);
			await conf.update('playwrightConfigPath', undefined);
			await vscode.workspace.openTextDocument(file).then(doc => vscode.window.showTextDocument(doc));
		});
	
		afterEach( async () => {
			await conf.update('playwrightCommand', undefined);
			await conf.update('playwrightConfigPath', undefined);
		});
		
		it('test 0', async () => {
			await conf.update('playwrightCommand', undefined);
			const cmd = PlaywrightCommandBuilder.getDebugConfig(file);
			assert.deepStrictEqual(cmd, {
				args: [
				  "test",
				  `mainpackage.spec.js`
				],
				console: "internalConsole",
				cwd: assetRootDir,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				env: {PWDEBUG: "console"},
				internalConsoleOptions: "openOnSessionStart",
				outputCapture:"std",
				name: "playwright",
				runtimeExecutable: "npx",
				runtimeArgs: ["playwright"],
				request: "launch",
				type: "pwa-node",
			});
		}).timeout(30000);	

		it('test 1', async () => {
			const cmd = PlaywrightCommandBuilder.getDebugConfig(file);
			assert.deepStrictEqual(cmd, {
				args: [
				  "abc",
				  "test",
				  `mainpackage.spec.js`
				],
				console: "internalConsole",
				cwd: assetRootDir,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				env: {PWDEBUG: "console"},
				internalConsoleOptions: "openOnSessionStart",
				outputCapture:"std",
				name: "playwright",
				program: "sample",
				request: "launch",
				type: "pwa-node",
			});
		}).timeout(30000);	
		
		it('test 2', async () => {
			const cmd = PlaywrightCommandBuilder.getDebugConfig(file, 'testcase');
			assert.deepStrictEqual(cmd, {
				args: [
				  "abc",
				  "test",
				  `mainpackage.spec.js`,
				  "-g",
				  "testcase"
				],
				console: "internalConsole",
				cwd: assetRootDir,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				env: {PWDEBUG: "console"},
				internalConsoleOptions: "openOnSessionStart",
				outputCapture:"std",
				name: "playwright",
				program: "sample",
				request: "launch",
				type: "pwa-node",
			});
		}).timeout(30000);
		
		it('test 3', async () => {
			const cmd = PlaywrightCommandBuilder.getDebugConfig(file, 'testcase', {args:["--aa"], sampleoption1:"aaa", env:{foo:"123"}});
			assert.deepStrictEqual(cmd, {
				args: [
				  "abc",
				  "test",
				  `mainpackage.spec.js`,
				  "-g",
				  "testcase",
				  "--aa"
				],
				console: "internalConsole",
				cwd: assetRootDir,
				internalConsoleOptions: "openOnSessionStart",
				outputCapture:"std",
				name: "playwright",
				program: "sample",
				request: "launch",
				type: "pwa-node",
				sampleoption1:"aaa",
				env: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					PWDEBUG: "console",
					foo:"123",
				}
			});
		}).timeout(30000);
		
		it('test 4', async () => {
			await vscode.workspace.openTextDocument(file2).then(doc => vscode.window.showTextDocument(doc));
			const cmd = PlaywrightCommandBuilder.getDebugConfig(file2);
			assert.deepStrictEqual(cmd, {
				args: [
				  "abc",
				  "test",
				  `subpackage.spec.js`
				],
				console: "internalConsole",
				cwd: assetRootDir+'/packages/subpackage',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				env: {PWDEBUG: "console"},
				internalConsoleOptions: "openOnSessionStart",
				outputCapture:"std",
				name: "playwright",
				program: "sample",
				request: "launch",
				type: "pwa-node",
			});
		}).timeout(30000);
	});
});
