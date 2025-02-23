import { z } from 'zod';
import { inject } from './inject';
import { Log } from './logger';

import ora from 'ora';
import shelljs from 'shelljs';
import { readFileSync } from 'fs';
import { basename } from 'path';
import chalk from 'chalk';

export type TaskActionParams = {
  resolve: (value: unknown) => void;
  reject: () => void;
  config: Record<string, unknown>;

  log: Log;
  shell: typeof shelljs;
  ora: typeof ora;
};

export type TaskAction = (params: TaskActionParams) => void;

export type TaskConfig = {
  name: string;
  description: string;
  do: TaskAction;
  config: Record<string, unknown>;
};

export const TaskSchema = z.object({
  name: z.string(),
  description: z.string(),
  do: z.function(),
});

type TaskSchema = z.infer<typeof TaskSchema>;

export class Task {
  private readonly _log = inject(Log);

  static from(filePath: string) {
    return new Task(filePath, basename(filePath, '.js'));
  }

  constructor(
    private _filePath: string,
    public id: string,
  ) {}

  private _task?: TaskSchema;

  get name() {
    return this._task?.name ?? '';
  }

  load() {
    const tr = ora(`Loading task "${chalk.hex('#0362fc')(this.name)}"`).start();
    try {
      this._task = TaskSchema.parse(
        eval(readFileSync(this._filePath, 'utf-8')),
      );
    } catch (err) {
      tr.fail(`Failed to load task "${chalk.hex('#0362fc')(this.name)}"`);
      console.error(err);

      return;
    }

    tr.succeed(`Loaded task "${chalk.hex('#0362fc')(this.name)}"`);
  }

  async run(allConfigs: Record<string, unknown>) {
    this._log.log(`Running task "${this.name}"`);

    const task = this._task;

    if (task === undefined) {
      return;
    }

    const config = allConfigs[this.id];

    try {
      await new Promise((resolve, reject) => {
        if (task.do && typeof task.do === 'function') {
          task.do({
            resolve,
            reject,
            config,
            log: this._log,
            ora: ora,
            shell: shelljs,
          });
        }
      });
    } catch (err) {
      this._log.error(`"${this.name}" execution failed`);
      console.error(err);
      return;
    }

    this._log.success(`"${this.name}" execution succeeded`);
  }
}
