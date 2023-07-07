import * as assert from 'assert';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';
import { RunnerConfig } from '../../runnerConfig';

describe('runnerConfig', async () => {
	vscode.window.showInformationMessage('Start config tests.');
	const conf = vscode.workspace.getConfiguration('playwrightrunner');
	let rootDir:vscode.Uri = vscode.Uri.file('.'); 
	if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
		rootDir = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri;
	}
	const assetRootDir = rootDir.fsPath.replace(/\\/g, '/');
	const config = new RunnerConfig(rootDir);

	describe('playwrightCommand', async () => {
		it('playwrightCommand test 1', async () => {
			await conf.update('playwrightCommand', 'sample');
			assert.strictEqual("sample", config.playwrightCommand);
		});
		it('playwrightCommand test 2', async () => {
			await conf.update('playwrightCommand', undefined);
			assert.strictEqual('npx playwright', config.playwrightCommand);
		});
		it('playwrightCommand test 3', async () => {
			await conf.update('playwrightCommand', undefined);
			assert.strictEqual('npx playwright', config.playwrightCommand);
		});
	});
	
	describe('playwrightBinPath', () => {
		it('playwrightConfigPath test 1', async () => {
			await conf.update('playwrightConfigPath', "aaa.js");
			assert.strictEqual("aaa.js", config.playwrightConfigPath);
		});
		it('playwrightConfigPath test 2', async () => {
			await conf.update('playwrightConfigPath', "${workspaceRoot}/aaa.js");
			assert.strictEqual(assetRootDir+"/aaa.js", config.playwrightConfigPath);
		});
		it('playwrightConfigPath test 3', async () => {
			await conf.update('playwrightConfigPath', undefined);
			assert.strictEqual(undefined, config.playwrightConfigPath);
		});
	});
	
	describe('playwrightRunOptions', () => {
		it('playwrightRunOptions test 1', async () => {
			await conf.update('playwrightRunOptions', ['aa','bb']);
			assert.deepStrictEqual(['aa','bb'], config.playwrightRunOptions);
		});
		it('playwrightRunOptions test 2', async () => {
			await conf.update('playwrightRunOptions', undefined);
			assert.deepStrictEqual([], config.playwrightRunOptions);
		});
	});
	
	describe('playwrightEnvironmentVariables', () => {
		it('playwrightEnvironmentVariables test 1', async () => {
			await conf.update('playwrightEnvironmentVariables', ["AA=123"]);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			assert.deepStrictEqual({AA:'123'}, config.playwrightEnvironmentVariables);
		});
		it('playwrightEnvironmentVariables test 2', async () => {
			await conf.update('playwrightEnvironmentVariables', ["AA=123=456"]);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			assert.deepStrictEqual({AA:'123=456'}, config.playwrightEnvironmentVariables);
		});
		it('playwrightEnvironmentVariables test 3', async () => {
			await conf.update('playwrightEnvironmentVariables', ["AA="]);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			assert.deepStrictEqual({AA:''}, config.playwrightEnvironmentVariables);
		});
		it('playwrightEnvironmentVariables test 4', async () => {
			await conf.update('playwrightEnvironmentVariables', ["AA"]);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			assert.deepStrictEqual({AA:''}, config.playwrightEnvironmentVariables);
		});
		it('playwrightEnvironmentVariables test 4', async () => {
			await conf.update('playwrightEnvironmentVariables', ['AA="1234"']);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			assert.deepStrictEqual({AA:'"1234"'}, config.playwrightEnvironmentVariables);
		});
		it('playwrightEnvironmentVariables test 5', async () => {
			await conf.update('playwrightEnvironmentVariables', ["AA=123=456=789"]);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			assert.deepStrictEqual({AA:'123=456=789'}, config.playwrightEnvironmentVariables);
		});
		it('playwrightEnvironmentVariables test default', async () => {
			await conf.update('playwrightEnvironmentVariables', undefined);
			assert.deepStrictEqual({}, config.playwrightEnvironmentVariables);
		});
	});
	
	describe('common', () => {
		it('projectPath test 1', async () => {
			const file = vscode.Uri.joinPath(rootDir, "tests/mainpackage.spec.js");
			const config = new RunnerConfig(file);
			await conf.update('projectPath', undefined);
			assert.strictEqual(assetRootDir, config.projectPath);
		});
	
		it('projectPath test 2', async () => {
			const file = vscode.Uri.joinPath(rootDir, "packages/subpackage/tests/subpackage.spec.js");
			const config = new RunnerConfig(file);
			await conf.update('projectPath', undefined);
			assert.strictEqual(assetRootDir+'/packages/subpackage', config.projectPath);
		});
	
		it('isCodeLensDisabled test false', async () => {
			await conf.update('disableCodeLens', false);
			assert.strictEqual(false, RunnerConfig.isCodeLensDisabled);
		});
		it('isCodeLensDisabled test true', async () => {
			await conf.update('disableCodeLens', true);
			assert.strictEqual(true, RunnerConfig.isCodeLensDisabled);
		});
		it('isCodeLensDisabled test undefined', async () => {
			await conf.update('disableCodeLens', undefined);
			assert.strictEqual(false, RunnerConfig.isCodeLensDisabled);
		});
	
		it('changeDirectoryToWorkspaceRoot test false', async () => {
			await conf.update('changeDirectoryToWorkspaceRoot', false);
			assert.strictEqual(false, RunnerConfig.changeDirectoryToWorkspaceRoot);
		});
		it('changeDirectoryToWorkspaceRoot test true', async () => {
			await conf.update('changeDirectoryToWorkspaceRoot', true);
			assert.strictEqual(true, RunnerConfig.changeDirectoryToWorkspaceRoot);
		});
		it('changeDirectoryToWorkspaceRoot test undefined', async () => {
			await conf.update('changeDirectoryToWorkspaceRoot', undefined);
			assert.strictEqual(true, RunnerConfig.changeDirectoryToWorkspaceRoot);
		});
	});
});
