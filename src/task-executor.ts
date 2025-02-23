import { readdirSync, statSync } from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { join } from 'path';
import { InertiaTaskConfigSchema } from './inertia-config';
import { inject } from './inject';
import { Log } from './logger';
import { Task } from './task';

export class TaskExecutor {
  private readonly _log = inject(Log);

  private readonly _tasks: Array<Task> = [];

  async load(directory: string, tasksConfig: InertiaTaskConfigSchema) {
    const taskLoadingSpinner = ora('Searching for tasks...').start();

    const tasksDir = join(directory, tasksConfig.directory);

    const tasksPaths = this._getTasksPaths(tasksDir);

    taskLoadingSpinner.succeed(`Found ${tasksPaths.length} tasks`);

    this._tasks.push(...tasksPaths.map((p) => Task.from(p)));

    for (const task of this._tasks) {
      task.load();
    }
  }

  async executeTasks(tasksConfig: InertiaTaskConfigSchema) {
    const inquirerConfig = {
      type: 'checkbox',
      name: 'tasks',
      message: 'Choose the tasks to run...',
      choices: this._tasks.map((t) => ({ name: t.name, value: t })),
    };

    const selection = await inquirer.prompt(inquirerConfig as any);

    const selectedTasks = selection.tasks as Array<Task>;

    if (selectedTasks.length === 0) {
      this._log.warn('No tasks selected. Exiting.');
      return;
    }

    const orderedTasks = selectedTasks.toSorted((a, b) => {
      const aIndex = tasksConfig.order.indexOf(a.id);
      const bIndex = tasksConfig.order.indexOf(b.id);

      let sortResult = 0;

      if (
        (aIndex !== -1 && bIndex === -1) ||
        (aIndex !== -1 && bIndex !== -1 && aIndex < bIndex)
      ) {
        sortResult = -1;
      }

      if (
        (aIndex === -1 && bIndex !== -1) ||
        (aIndex !== -1 && bIndex !== -1 && bIndex < aIndex)
      ) {
        sortResult = 1;
      }

      return sortResult;
    });

    for (const task of orderedTasks) {
      await task.run(tasksConfig.configs);
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
