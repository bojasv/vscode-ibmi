// The module 'vscode' contains the VS Code extensibility API
import {ExtensionContext, window, commands, workspace} from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

import instance from './Instance';
import {CustomUI, Field} from "./api/CustomUI";

import connectionBrowser from "./views/connectionBrowser";
import IBMi from "./api/IBMi";

export function activate(context: ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(`Congratulations, your extension "code-for-ibmi" is now active!`);

  //We setup the event emitter.
  instance.setupEmitter();

  context.subscriptions.push(
    window.registerTreeDataProvider(
      `connectionBrowser`,
      new connectionBrowser(context)
    ),

    commands.registerCommand(`code-for-ibmi.connectDirect`, 
      /**
       * @param {ConnectionData} connectionData 
       * @returns {Promise<Boolean>}
       */
      async (connectionData) => {
        const existingConnection = instance.getConnection();

        if (existingConnection) return false;

        const connection = new IBMi();
        const connected = await connection.connect(connectionData);
        if (connected.success) {
          instance.setConnection(connection);
          instance.loadAllofExtension(context);
        }

        return connected.success;
      }
    ),

    workspace.onDidChangeConfiguration(async event => {
      const connection = instance.getConnection();
      if (connection) {
        const config = instance.getConfig();

        if (config) {
          if (event.affectsConfiguration(`code-for-ibmi.connectionSettings`)) {
            await config.reload();
          }
        }
      }
    })
  )

  return {instance, CustomUI, Field, baseContext: context};
}

// this method is called when your extension is deactivated
export function deactivate() {}