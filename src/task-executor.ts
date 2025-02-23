import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { InertiaTaskConfigSchema } from './inertia-config';
import { inject } from './inject';
import { Log } from './logger';
import { TaskConfig } from './task';

export class TaskExecutor {
  private readonly _log = inject(Log);

  private readonly _tasks: Array<TaskConfig> = [];

  async load(directory: string, tasksConfig: InertiaTaskConfigSchema) {
    const tasksDir = join(directory, tasksConfig.directory);

    const tasksPaths = this._getTasksPaths(tasksDir);

    const tasks = tasksPaths.map((p) => {
      return () => {
        try {
          return eval(readFileSync(p, 'utf-8')) as TaskConfig;
        } catch (err) {
          this._log.error(`Failed to load task ${p}`);
          console.error(err);
        }
      };
    });

    for (const task of tasks) {
      const t = task();

      if (t) {
        this._tasks.push(t);
      }
    }
  }

  async executeTasks() {
    for (const task of this._tasks) {
      console.log('EXECUTING', task.name);
    }
  }

  private _getTasksPaths(taskDirectory: string): Array<string> {
    return readdirSync(taskDirectory).flatMap((d) => {
      const p = join(taskDirectory, d);
      return statSync(p).isDirectory() ? this._getTasksPaths(p) : p;
    });
  }
}
