import * as vscode from 'vscode';
import {TextEditor, WebviewPanel} from "vscode";
import * as path from 'path';

const CodeGridMarkdown: any = require('codegrid-markdown');


const cgmdRenderer = new CodeGridMarkdown();


export function activate(context: vscode.ExtensionContext) {

  console.log('ð«Extension "vscode-codegrid-markdown-preview" is now active!');

  const disposable = vscode.commands.registerCommand('vscode-codegrid-markdown-preview.sidePreview', (): void => {
    initCodeGridMarkdownPreview(context);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

// ãã¬ãã¥ã¼ç¨
function initCodeGridMarkdownPreview(context: vscode.ExtensionContext): void {
  // Webviewããã«ä½æ
  const panel = vscode.window.createWebviewPanel(
    'cgmdPreviewer', // Webview ID
    `[Preview]`, // ã¿ã¤ãã«
    2, // 2çªç®ã®ã«ã©ã ã«Webviewãéã
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

  // ã¨ãã£ã¿ã®åå®¹ãå¤ãã£ãããã¬ãã¥ã¼ãæ´æ°ãã
  vscode.workspace.onDidChangeTextDocument(update);
  // ã¿ããå¤ãã£ãããã¬ãã¥ã¼ãæ´æ°ãã
  vscode.window.onDidChangeActiveTextEditor(update);
}

// ãã¬ãã¥ã¼ãæ´æ°
function updateWebview(panel: WebviewPanel): void {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;

  // ã¢ã¯ãã£ããªã¿ãããªãã£ããä½ãããªã
  if (!editor) {
    return;
  }

  const filePath = getFilePath(editor);
  const isMarkdown = isMarkdownFile(filePath);

  // Markdownãã¡ã¤ã«ã®ã¨ãã ãWebViewã«æç»ãã
  if (isMarkdown) {
    const fileName = path.basename(filePath);
    const content = getContent(editor);
    const contentHtml = render(content);
    panel.title = `[Preview] ${fileName}`;
    panel.webview.html = getHtml(contentHtml);
  }
}

// ã¢ã¯ãã£ããªã¿ãã®ä¸­èº«
function getContent(editor: TextEditor): string {
  if (editor) {
    return editor.document.getText();
  }
  return '';
}

// ã¢ã¯ãã£ããªã¿ãã®ãã¡ã¤ã«ãã¹
function getFilePath(editor: TextEditor): string {
  if (editor) {
    return editor.document.fileName;
  }
  return '';
}

// Markdownãã©ãã
function isMarkdownFile(filePath: string): boolean {
  const fileExtension = path.extname(filePath);
  return /\.(md|markdown)$/i.test(fileExtension);
}

// CodeGrid Markdownã®ã¬ã³ããªã³ã°
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
