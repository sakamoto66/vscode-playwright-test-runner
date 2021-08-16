import * as path from 'path';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { describe, it } from 'mocha';
import { parse, findTestCode } from '../../playwright-editor-support';

describe('playwright-editor-support', () => {
	let rootDir:vscode.Uri = vscode.Uri.file('.'); 
	if(undefined !== vscode.workspace.workspaceFolders && 0 < vscode.workspace.workspaceFolders.length){
		rootDir = vscode.workspace.workspaceFolders[0] && vscode.workspace.workspaceFolders[0].uri;
	}
  const testcodes2 = parse(rootDir.fsPath+'/tests/mainpackage.spec.js');

  it('mainpackage.spec.js should find line 3', () => {
    const hit = findTestCode(testcodes2, 3);
    assert.deepStrictEqual(hit && hit.fullname,'basic test');
  });

  it('mainpackage.spec.js should find line 9', () => {
    const hit = findTestCode(testcodes2, 9);
    assert.deepStrictEqual(hit && hit.fullname,'describe 01');
  });
  
  it('mainpackage.spec.js should find line 10', () => {
    const hit = findTestCode(testcodes2, 10);
    assert.deepStrictEqual(hit && hit.fullname,'describe 01 runs first 01');
  });
  
  it('mainpackage.spec.js should find line 11', () => {
    const hit = findTestCode(testcodes2, 11);
    assert.deepStrictEqual(hit && hit.fullname,'describe 01 runs second 01');
  });

  it('mainpackage.spec.js should find line 14', () => {
    const hit = findTestCode(testcodes2, 14);
    assert.deepStrictEqual(hit && hit.fullname,'describe 02');
  });
  
  it('mainpackage.spec.js should find line 15', () => {
    const hit = findTestCode(testcodes2, 15);
    assert.deepStrictEqual(hit && hit.fullname,'describe 02 runs first 02');
  });
  
  it('mainpackage.spec.js should find line 16', () => {
    const hit = findTestCode(testcodes2, 16);
    assert.deepStrictEqual(hit && hit.fullname,'describe 02 runs second 02');
  }); 
});
