import { readdirSync, statSync } from 'fs';
import { createSpinner } from 'nanospinner';
import { join } from 'path';
import { plugins } from 'src/plugins';

import { InertiaTaskConfigSchema } from '../inertia-config';
import { inject } from '../util/inject';
import { Log } from '../util/logger';
import { Task } from './task';

export class TaskExecutor {
  private readonly _log = inject(Log);

  private readonly _tasks: Array<Task> = [];

  private _config!: InertiaTaskConfigSchema;

  async load(directory: string, tasksConfig: InertiaTaskConfigSchema) {
    this._config = tasksConfig;

    const taskLoadingSpinner = createSpinner('Searching for tasks...').start();

    const tasksDir = join(directory, tasksConfig.directory ?? './tasks');

    const tasksPaths = this._getTasksPaths(tasksDir);

    taskLoadingSpinner.success(
      `Found ${tasksPaths.length} task${tasksPaths.length === 1 ? '' : 's'}`,
    );

    this._tasks.push(...tasksPaths.map((p) => Task.from(p)));

    for (const task of this._tasks) {
      task.load();
    }
  }

  async executeTasks() {
    const orderedTasks = this._config.steps;

    if (orderedTasks.length === 0) {
      this._log.warn('No tasks. Exiting.');
      return;
    }

    for (const task of orderedTasks) {
      if (task.skip) {
        this._log.warn(`Skipping task "${task.id}"`);

        continue;
      }

      switch (task.type) {
        case 'LOCAL': {
          const localTask = this._tasks.find((t) => t.id === task.id);
          if (localTask) {
            await localTask.run(task.config ?? {});
          }
          break;
        }
        case 'PLUGIN': {
          const plugin = plugins.get(task.id);
          if (plugin) {
            await plugin.do(task.config);
          } else {
            this._log.error(`Cannot find plugin with id "${task.id}"`);
          }
          break;
        }
        default:
          this._log.warn(
            `Unknown task type "${task.type}". Please correct the config.`,
          );
      }
    }
  }

  private _getTasksPaths(taskDirectory: string): Array<string> {
    return readdirSync(taskDirectory).flatMap((d) => {
      const taskPath = join(taskDirectory, d);
      return statSync(taskPath).isDirectory()
        ? this._getTasksPaths(taskPath)
        : taskPath;
    });
  }
}
