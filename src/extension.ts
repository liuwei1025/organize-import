import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.organizeImportsOnChangedFiles', async () => {
        const gitExtension = vscode.extensions.getExtension('vscode.git')!.exports;
        const api = gitExtension.getAPI(1);
        
        // 获取当前激活的编辑器
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return; // 如果没有打开的编辑器，直接返回
        }

        // 获取当前打开文件的 URI
        const uri = activeEditor.document.uri;

        // 查找当前文件所在的仓库
        const repo = api.repositories.find((repository: any) => {
            return repository.rootUri.toString() === uri.toString().substring(0, repository.rootUri.toString().length);
        });

        if (!repo) {
            vscode.window.showErrorMessage('Unable to find Git repository for the active file.');
            return;
        }

        // 获取该仓库中有变动的文件
        const changedFiles = repo.state.workingTreeChanges;

        let editor;
        for (const file of changedFiles) {
            const document = await vscode.workspace.openTextDocument(file.uri);
            if (!editor) {
                editor = await vscode.window.showTextDocument(document, { preview: false });
            } else {
                await vscode.window.showTextDocument(document, { preview: true, viewColumn: editor.viewColumn });
            }
            await vscode.commands.executeCommand('editor.action.organizeImports');
            await document.save();
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
