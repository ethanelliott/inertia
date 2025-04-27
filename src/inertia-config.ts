import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import { z } from 'zod';

import { inject } from './util/inject';
import { Log } from './util/logger';

export const InertiaTaskStepTypeSchema = z.enum(['LOCAL', 'PLUGIN']);

export const InertiaTaskStepSchema = z.object({
  type: InertiaTaskStepTypeSchema,
  id: z.string(),
  skip: z.boolean().optional().default(false),
  config: z.record(z.string(), z.any()).optional().default({}),
});

export const InertiaTaskConfigSchema = z.object({
  directory: z.string().optional(),
  steps: z.array(InertiaTaskStepSchema).optional().default([]),
});

export const InertialLinksConfigSchema = z.object({
  directory: z.string().optional(),
  target: z.string().optional(),
  backup: z.boolean().optional(),
});

export const InertiaConfigSchema = z.object({
  name: z.string(),
  links: InertialLinksConfigSchema.optional().default({}),
  tasks: InertiaTaskConfigSchema.optional().default({}),
});

export type InertiaTaskStepTypeSchema = z.infer<
  typeof InertiaTaskStepTypeSchema
>;

export type InertiaTaskConfigSchema = z.infer<typeof InertiaTaskConfigSchema>;

export type InertiaTaskStepSchema = z.infer<typeof InertiaTaskStepSchema>;

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
