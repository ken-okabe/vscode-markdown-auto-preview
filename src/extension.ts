import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Track the last active document URI to handle navigation correctly
    let lastActiveUri: string | undefined = undefined;

    // Create Status Bar Item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);

    // Register Commands
    const toggleCommand = vscode.commands.registerCommand('vscode-markdown-auto-preview.togglePreview', () => {
        vscode.commands.executeCommand('markdown.showPreview');
    });

    const showSourceCommand = vscode.commands.registerCommand('vscode-markdown-auto-preview.showSource', async () => {
        if (lastActiveUri) {
            try {
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(lastActiveUri));
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
            } catch (e) {
                console.error('Failed to open source', e);
            }
        }
    });

    context.subscriptions.push(toggleCommand, showSourceCommand);

    // Function to handle editor changes and status bar updates
    const handleEditorChange = (editor: vscode.TextEditor | undefined) => {
        if (editor && editor.document.languageId === 'markdown') {
            const currentUri = editor.document.uri.toString();

            // If the active document is different from the last one we handled,
            // (New Visit) -> Open Preview
            if (currentUri !== lastActiveUri) {
                lastActiveUri = currentUri;
                vscode.commands.executeCommand('markdown.showPreview');
                // The status bar update will happen when the preview takes focus (editor becomes undefined)
                // But initially, it might still be defined. Let's wait for event.
            } else {
                // (Same Visit) -> We are seeing the Source Editor again.
                // Show "Open Preview"
                statusBarItem.text = '$(preview) Open Preview';
                statusBarItem.tooltip = 'Switch to Markdown Preview';
                statusBarItem.command = 'vscode-markdown-auto-preview.togglePreview';
                statusBarItem.show();
            }
        } else if (!editor && lastActiveUri) {
            // Editor is undefined -> Likely Focus is on Preview or Output interactively
            // If we have a tracked markdown file, assume we are viewing it in Preview
            statusBarItem.text = '$(code) Open Source';
            statusBarItem.tooltip = 'Switch to Markdown Source';
            statusBarItem.command = 'vscode-markdown-auto-preview.showSource';
            statusBarItem.show();
        } else {
            // Active editor is NOT markdown (e.g. .ts file)
            statusBarItem.hide();

            // Update lastActiveUri for non-markdown files too, 
            // so switching back to markdown triggers the "New Visit" logic.
            if (editor) {
                lastActiveUri = editor.document.uri.toString();
            }
        }
    };

    // Check on activation (for the currently active file)
    handleEditorChange(vscode.window.activeTextEditor);

    // Check whenever the active editor changes
    const changeDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
        handleEditorChange(editor);
    });

    context.subscriptions.push(changeDisposable);
}

export function deactivate() { }
