import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IMessagePreambleRegistry } from '@jupyter/chat';

import { submitPermissionDecision } from './request';
import { createToolCallsPreamble } from './tool-call-preamble';
import { getOpenableToolCallPath } from './tool-call-paths';

const TOOL_CALL_COMPONENTS_PLUGIN_ID =
  '@jupyter-ai/acp-client:tool-call-components';

/**
 * Plugin that renders ACP tool calls using jupyter-chat-components through the
 * chat preamble registry.
 */
export const toolCallComponentsPlugin: JupyterFrontEndPlugin<void> = {
  id: TOOL_CALL_COMPONENTS_PLUGIN_ID,
  description:
    'Renders ACP grouped tool calls with jupyter-chat-components.',
  autoStart: true,
  optional: [IMessagePreambleRegistry],
  activate: (
    app: JupyterFrontEnd,
    preambleRegistry: IMessagePreambleRegistry | null
  ) => {
    if (!preambleRegistry) {
      console.warn(
        '[ACP] IMessagePreambleRegistry not available; tool call UI disabled.'
      );
      return;
    }

    preambleRegistry.addComponent(
      createToolCallsPreamble({
        openToolCallPath: (path: string) => {
          const openPath = getOpenableToolCallPath(path);

          if (!openPath) {
            return;
          }

          void app.commands.execute('docmanager:open', { path: openPath });
        },
        toolCallPermissionDecision: submitPermissionDecision
      })
    );
  }
};

export default [toolCallComponentsPlugin];
