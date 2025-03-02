import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import { z } from 'zod';

import { inject } from './util/inject';
import { Log } from './util/logger';

export const InertiaPluginConfigSchema = z.object({
  name: z.string(),
});

export const InertiaTaskConfigSchema = z.object({
  directory: z.string().optional(),
  order: z.array(z.string()).optional(),
  configs: z.record(z.string(), z.any()).optional(),
});

export const InertialLinksConfigSchema = z.object({
  directory: z.string().optional(),
  target: z.string().optional(),
  backup: z.boolean().optional(),
});

export const InertiaConfigSchema = z.object({
  name: z.string(),
  plugins: z.array(InertiaPluginConfigSchema).optional(),
  links: InertialLinksConfigSchema.optional().default({}),
  tasks: InertiaTaskConfigSchema.optional().default({}),
});

export type InertiaTaskConfigSchema = z.infer<typeof InertiaTaskConfigSchema>;

export type InertialLinksConfigSchema = z.infer<
  typeof InertialLinksConfigSchema
>;

export type InertiaConfigSchema = z.infer<typeof InertiaConfigSchema>;

export class InertiaConfig {
  private readonly _log = inject(Log);

  load(rootConfigPath: string) {
    try {
      return InertiaConfigSchema.parse(
        this._getFileContents(rootConfigPath, this._getFile(rootConfigPath)),
      );
    } catch (err) {
      this._log.error('Failed to load config.');
      console.error(err);
    }
  }

  private _getFile(rootConfigPath: string) {
    const possibleConfigFiles = readdirSync(rootConfigPath).filter((e) =>
      e.match(/inertia\.(\w*)$/g),
    );

    if (possibleConfigFiles.length === 0) {
      throw new Error('Cannot find a config file');
    }

    const type = possibleConfigFiles[0].split('.').at(-1) as string;

    return { name: possibleConfigFiles[0], type };
  }

  private _getFileContents(
    rootConfigPath: string,
    configFile: {
      name: string;
      type: string;
    },
  ) {
    const fileContents = readFileSync(
      join(rootConfigPath, configFile.name),
      'utf-8',
    );
    switch (configFile.type) {
      case 'json':
        return JSON.parse(fileContents);
      case 'yaml':
        return YAML.parse(fileContents);
      default:
        throw new Error(`Unknown config file format "${configFile.type}"`);
    }
  }
}
