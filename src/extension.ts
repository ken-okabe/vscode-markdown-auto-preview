import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-markdown-auto-preview" is now active!');

    let disposable = vscode.commands.registerCommand('vscode-markdown-auto-preview.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from vscode-markdown-auto-preview!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
