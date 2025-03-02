import { readdirSync, statSync } from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { join } from 'path';

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

    const taskLoadingSpinner = ora('Searching for tasks...').start();

    const tasksDir = join(directory, tasksConfig.directory ?? './tasks');

    const tasksPaths = this._getTasksPaths(tasksDir);

    taskLoadingSpinner.succeed(
      `Found ${tasksPaths.length} task${tasksPaths.length === 1 ? '' : 's'}`,
    );

    this._tasks.push(...tasksPaths.map((p) => Task.from(p)));

    for (const task of this._tasks) {
      task.load();
    }
  }

  async executeTasks() {
    const selectedTasks = await this._selectTasks();

    if (selectedTasks.length === 0) {
      this._log.warn('No tasks selected. Exiting.');
      return;
    }

    let orderedTasks = selectedTasks;

    if (this._config.order) {
      orderedTasks = this._orderTasks(this._config.order, selectedTasks);
    }

    for (const task of orderedTasks) {
      await task.run(this._config?.configs?.[task.id] ?? {});
    }
  }

  private async _selectTasks() {
    const inquirerConfig = {
      type: 'checkbox',
      name: 'tasks',
      message: 'Choose the tasks to run...',
      choices: this._tasks.map((t) => ({ name: t.name, value: t })),
    };

    const selection = await inquirer.prompt(inquirerConfig as any);

    return selection.tasks as Array<Task>;
  }

  private _orderTasks(order: Array<string>, tasks: Array<Task>) {
    return tasks.toSorted((a, b) => {
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);

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
