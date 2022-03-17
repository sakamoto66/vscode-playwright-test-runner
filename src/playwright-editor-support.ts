/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { readFileSync } from 'fs';
import * as parser from '@babel/parser';
import { parseOptions } from './helper';
import { escapeRegExp, resolveTestNameStringInterpolation } from './util';

export class TestCode {
  public prefix: string = '';
  public type: string = '';
  public name: string = '';
  public fullname: string = '';
  public startline: number = -1;
  public startcolumn: number = -1;
  public endline: number = -1;
  public endcolumn: number = -1;
  public get testPattern(): string | undefined {
    if("test"===this.type) {
      return resolveTestNameStringInterpolation(this.fullname)+"$";
    }
    return resolveTestNameStringInterpolation(this.fullname)+"\\s+\\S+";
  }
}

export const parse = (filepath: string, data?: string): TestCode[] => {
  const _data = data || readFileSync(filepath).toString();
  const fileOption = parseOptions(filepath);
  const ast = parser.parse(_data, fileOption);
  const { program } = ast;
  return findTestMethods(program);
};

export function findTestCode(tests: TestCode[], line: number): TestCode | undefined {
  if (!tests) {
    return;
  }
  const elm = tests.find((elm) => line === elm.startline || line === elm.endline);
  if (elm) {
    return elm;
  }
  const els = tests.filter((elm) => elm.startline < line && line < elm.endline);
  if (0 < els.length) {
    return els[els.length - 1];
  }
}


function findTestMethods(program: unknown): TestCode[] {
  const ptnName1 = new RegExp(`${escapeRegExp('expression/callee/name')}$`);
  const ptnName2 = new RegExp(`${escapeRegExp('expression/callee/object/name')}$`);
  const ptnName5 = new RegExp(`${escapeRegExp('expression/callee/object/object/name')}$`);
  const ptnName6 = new RegExp(`${escapeRegExp('expression/callee/object/object/object/name')}$`);
  const funcNames1 = ['it', 'test', 'describe'];
  const funcNames2 = ['describe', 'only'];
  const funcNames5type1 = ['describe'];
  const funcNames5type2 = ['serial', 'parallel'];
  const funcNames6type1 = ['only'];

  // convert
  const items:any[] = [];
  node2path(program, (path:any, value:any) => items.push([path, value]));

  const names = items.filter((i) => /\/name$/.test(i[0]) && -1 < funcNames1.indexOf(i[1]));
  // match test(...)
  const pathPrefix1 = names
    .filter((i) => ptnName1.test(i[0]))
    .map((i) => [i[0].replace(ptnName1, 'expression/'), i[1]]);

  // match test.xxx(...)
  const pathPrefix2 = names
    .filter((i) => ptnName2.test(i[0]))
    .map((i) => {
      const prefix = i[0].replace(ptnName2, 'expression/');
      const type = items.find((i) => `${prefix}callee/property/name` === i[0] && -1 < funcNames2.indexOf(i[1]));
      return [prefix, type ? type[1] : null];
    })
    .filter((f) => f[1]);

  // match test.xxx.xxx(...)
  const pathPrefix5 = names
    .filter((i) => ptnName5.test(i[0]))
    .map((i) => {
      const prefix = i[0].replace(ptnName5, 'expression/');
      const type1 = items.find((i) => `${prefix}callee/object/property/name` === i[0] && -1 < funcNames5type1.indexOf(i[1]));
      const type2 = items.find((i) => `${prefix}callee/property/name` === i[0] && -1 < funcNames5type2.indexOf(i[1]));

      return [prefix, type1 && type2 ? type1[1] : null];
    })
    .filter((f) => f[1]);

  // match test.xxx.xxx.xxx(...)
  const pathPrefix6 = names
    .filter((i) => ptnName6.test(i[0]))
    .map((i) => {
      const prefix = i[0].replace(ptnName6, 'expression/');
      const type1 = items.find((i) => `${prefix}callee/object/object/property/name` === i[0] && -1 < funcNames5type1.indexOf(i[1]));
      const type2 = items.find((i) => `${prefix}callee/object/property/name` === i[0] && -1 < funcNames5type2.indexOf(i[1]));
      const type3 = items.find((i) => `${prefix}callee/property/name` === i[0] && -1 < funcNames6type1.indexOf(i[1]));
      return [prefix, type1 && type2 && type3 ? type1[1] : null];
    })
    .filter((f) => f[1]);

  const all: string[][] = [...pathPrefix1, ...pathPrefix2, ...pathPrefix5, ...pathPrefix6];
  all.sort((a, b) => (a[0] > b[0] ? 1 : -1));

  const elements: TestCode[] = all.map((prefix) => {
    const ptnPosition = new RegExp(`^${escapeRegExp(prefix[0])}loc/(start|end)/`);
    const ptnTestName = new RegExp(`^${escapeRegExp(prefix[0] + 'arguments[0]/')}(value|quasis\\[\\d+\\]/value/raw)$`);
    const element: TestCode = new TestCode();
    element.prefix = prefix[0];
    element.type = prefix[1];
    items
      .filter((i) => ptnPosition.test(i[0]))
      .forEach((i) => {
        const m = /[^/]+\/[^/]+$/.exec(i[0]);
        if(m){
          switch(m[0]) {
            case 'start/line':element.startline = i[1];break;
            case 'start/column':element.startcolumn = i[1];break;
            case 'end/line':element.endline = i[1];break;
            case 'end/column':element.endcolumn = i[1];break;
          }
        }
      });
    element.name = items
      .filter((i) => ptnTestName.test(i[0]))
      .map((i) => i[1])
      .join('${i}');
    element.fullname = element.name;
    return element;
  });
  elements.forEach((element) => {
    const head = [''];
    element.fullname = element.prefix
      .split('/expression/')
      .filter((f) => 0 < f.length)
      .map((p) => {
        head[0] += `${p}/expression/`;
        const el = elements.find((e) => e.prefix === head[0]);
        return el ? el.name : null;
      })
      .filter((f) => f)
      .join(' ');
  });
  return elements;
}

function node2path(node:any, fn:Function, path = '') {
  if (node === null || typeof node === 'undefined') {return;}
  if (Array.isArray(node)) {
    node.forEach((child, idx) => node2path(child, fn, `${path}[${idx}]`));
    return;
  }
  if (typeof node === 'object') {
    Object.keys(node).forEach((key) => node2path(node[key], fn, `${path}/${key}`));
    return;
  }
  fn.call(null, path, node);
}
