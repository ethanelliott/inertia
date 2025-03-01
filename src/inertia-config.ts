import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { inject } from './util/inject';
import { Log } from './util/logger';

export const InertiaTaskConfigSchema = z.object({
  directory: z.string().default('./tasks'),
  order: z.array(z.string()),
  configs: z.record(z.string(), z.any()),
});

export const InertialLinksConfigSchema = z.object({
  directory: z.string().optional(),
  target: z.string().optional(),
  backup: z.boolean().optional(),
});

export const InertiaConfigSchema = z.object({
  name: z.string(),
  links: InertialLinksConfigSchema.optional(),
  tasks: InertiaTaskConfigSchema.optional(),
});

export type InertiaTaskConfigSchema = z.infer<typeof InertiaTaskConfigSchema>;

export type InertialLinksConfigSchema = z.infer<
  typeof InertialLinksConfigSchema
>;

export type InertiaConfigSchema = z.infer<typeof InertiaConfigSchema>;

export class InertiaConfig {
  private static readonly _DEFAULT_CONFIG_FILENAME = 'inertia.json';

  private readonly _log = inject(Log);

  load(rootConfigPath: string) {
    try {
      const rawConfig = JSON.parse(
        readFileSync(
          join(rootConfigPath, InertiaConfig._DEFAULT_CONFIG_FILENAME),
          'utf-8',
        ),
      );
      return InertiaConfigSchema.parse(rawConfig);
    } catch (err) {
      this._log.error('Failed to load config.');
      console.error(err);
    }
  }
}
