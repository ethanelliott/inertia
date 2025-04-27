import { BrewPlugin } from './brew/brew.plugin';
import { CommandPlugin } from './command/command.plugin';
import { NodePlugin } from './node/node.plugin';
import { InertiaPlugin } from './plugin';

const availablePlugins = [BrewPlugin, CommandPlugin, NodePlugin];

export const plugins = new Map<string, InertiaPlugin>(
  availablePlugins.map((PluginConstructor) => {
    const plugin = new PluginConstructor();
    return [plugin.id, plugin];
  }),
);
