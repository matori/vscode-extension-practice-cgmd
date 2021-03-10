import * as vscode from 'vscode';
import {TextEditor, WebviewPanel} from "vscode";
import * as path from 'path';

const CodeGridMarkdown: any = require('codegrid-markdown');


const cgmdRenderer = new CodeGridMarkdown();


export function activate(context: vscode.ExtensionContext) {

  console.log('💫Extension "vscode-codegrid-markdown-preview" is now active!');

  const disposable = vscode.commands.registerCommand('vscode-codegrid-markdown-preview.sidePreview', (): void => {
    initCodeGridMarkdownPreview(context);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

// プレビュー用
function initCodeGridMarkdownPreview(context: vscode.ExtensionContext): void {
  // Webviewパネル作成
  const panel = vscode.window.createWebviewPanel(
    'cgmdPreviewer', // Webview ID
    `[Preview]`, // タイトル
    2, // 2番目のカラムにWebviewを開く
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'assets'))]
    }
  );

  function update(): void {
    updateWebview(panel);
  }

  update();

  // エディタの内容が変わったらプレビューを更新する
  vscode.workspace.onDidChangeTextDocument(update);
  // タブが変わったらプレビューを更新する
  vscode.window.onDidChangeActiveTextEditor(update);
}

// プレビューを更新
function updateWebview(panel: WebviewPanel): void {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;

  // アクティブなタブがなかったら何もしない
  if (!editor) {
    return;
  }

  const filePath = getFilePath(editor);
  const isMarkdown = isMarkdownFile(filePath);

  // MarkdownファイルのときだけWebViewに描画する
  if (isMarkdown) {
    const fileName = path.basename(filePath);
    const content = getContent(editor);
    const contentHtml = render(content);
    panel.title = `[Preview] ${fileName}`;
    panel.webview.html = getHtml(contentHtml);
  }
}

// アクティブなタブの中身
function getContent(editor: TextEditor): string {
  if (editor) {
    return editor.document.getText();
  }
  return '';
}

// アクティブなタブのファイルパス
function getFilePath(editor: TextEditor): string {
  if (editor) {
    return editor.document.fileName;
  }
  return '';
}

// Markdownかどうか
function isMarkdownFile(filePath: string): boolean {
  const fileExtension = path.extname(filePath);
  return /\.(md|markdown)$/i.test(fileExtension);
}

// CodeGrid Markdownのレンダリング
function render(text: string): string {
  return cgmdRenderer.render(text);
}

function getHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <title>Preview</title>
  <link rel="stylesheet" href="https://www.codegrid.net/css/common.css">
  <link rel="stylesheet" href="https://www.codegrid.net/css/article.css">
  <style>body{color:var(--base-font-color)}</style>
</head>
<body>
<div class="cg-CGMarkdown">
${content}
</div>
</body>
</html>`;
}
