import { z } from 'zod';
import { inject } from './inject';
import { Log } from './logger';
import ora from 'ora';
import shell from 'shelljs';
import { readFileSync } from 'fs';
import { basename } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export type TaskActionParams = {
  config: Record<string, unknown>;
  log: Log;
  shell: typeof shell;
  ora: typeof ora;
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

  async run(config: any) {
    this._log.log(`Running task "${this.name}"`);

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
          ora,
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
