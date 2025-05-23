import chalk from 'chalk';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { basename } from 'path';
import shell from 'shelljs';
import { z } from 'zod';

import { inject } from '../util/inject';
import { Log } from '../util/logger';

export type TaskActionParams = {
  config: Record<string, unknown>;
  log: Log;
  shell: typeof shell;
  spinner: typeof createSpinner;
  inquirer: typeof inquirer;
};

export type TaskAction = (params: TaskActionParams) => Promise<void>;

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
  static from(filePath: string) {
    return new Task(filePath, basename(filePath, '.js'));
  }

  private readonly _log = inject(Log);

  private _task!: TaskSchema;

  get name() {
    return this._task?.name ?? '';
  }

  constructor(
    private _filePath: string,
    public id: string,
  ) {}

  load() {
    const tr = createSpinner(
      `Loading task "${chalk.hex('#0362fc')(this.name)}"`,
    ).start();
    try {
      this._task = TaskSchema.parse(
        eval(readFileSync(this._filePath, 'utf-8')),
      );
    } catch (err) {
      tr.error(`Failed to load task "${chalk.hex('#0362fc')(this.name)}"`);
      console.error(err);

      return;
    }

    tr.success(`Loaded task "${chalk.hex('#0362fc')(this.name)}"`);
  }

  async run(config: any) {
    this._log.info(`Running task "${this.name}"`);

    const task = this._task;

    if (task === undefined) {
      this._log.error('Invalid task. Cannot execute.');
      return;
    }

    try {
      if (task.do && typeof task.do === 'function') {
        await task.do({
          config,
          log: this._log,
          spinner: createSpinner,
          shell,
          inquirer,
        });
      }
    } catch (err) {
      this._log.error(`"${this.name}" execution failed`);
      console.error(err);
      return;
    }

    this._log.success(`"${this.name}" execution succeeded`);
  }
}
