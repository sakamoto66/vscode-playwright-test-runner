# Change Log

## 1.1.0 - 2021-08-19

- Feature: add playwrightrunner.playwrightEnvironmentVariables
- Feature: remove playwrightrunner.playwrightDebugOptions
- Fix: Fixed an issue where command execution would fail if playwrightrunner.playwrightCommand was set.

## 1.0.0 - 2021-08-17

- Feature: supported codege form menue of explorer.
- Feature: supported "test.describe.serial".
- Feature: Changed the test case specification to a regular expression.
- Fix: Fixed an issue where multiple terminals would launch.

## 0.6.2 - 2021-08-14

- Feature: change terminal to debug console when run debug.
- Feature: remove setting value "playwrightrunner.playwrightPath"
- Feature: remove setting value "playwrightrunner.enableYarnPnpSupport"
- Feature: update Readme

## 0.5.2 - 2021-07-26

- Fix: faild when add option '--headed' on debug mode.

## 0.5.1 - 2021-07-21

- Fix: not show CodeLens on typescript(*.ts).

## 0.5.0 - 2021-07-21

- Fix: diseble jest mode. suported only playwright mode.

## 0.4.0 - 2021-07-11

- Feature: support show-trace command from menu of explorer(*.zip).
- Fix: show icon when status is timedOut on Test Report.

## 0.3.1 - 2021-07-09

- Fix: update README.md

## 0.3.0 - 2021-07-09

- Feature: update README.md
- Feature: support show playwright test report
- Feature: add shortcut menus on explorer for (*.ts,*.js,*.json)
- Fix: refactoring

## 0.2.2 - 2021-07-04

- Fix: rename inspector to inspect.

## 0.2.1 - 2021-07-03

- Feature: update README.md
- Fix: rename ${currentFileDir} -> ${currentFile}

## 0.2.0 - 2021-07-02

- Feature: refactor
- Feature: supported varibale ``${workspaceRoot}``,``${packageRoot}``,``${currentFile}``,``${fileExtname}``,``${fileBasenameNoExtension}``,``${fileBasename}``,``${fileDirname}``.
- Fix: bug
  
## 0.1.1 - 2021-06-29

- fix: Fixed an issue where playwrith options were not reflected.
- fix: rename inspector to inspect.
- fix: set set env:PWDEBUG=console shen debug mode.

## 0.1.0 - 2021-06-28

- Initial release
- fork firsttris/vscode-jest-runner version 0.4.44
- support playwright-test

---

The file format is based on [Keep a Changelog](http://keepachangelog.com/).
