import { CLIProgram } from './cli';
import { InertiaConfig } from './inertia-config';
import { inject } from './inject';
import { Log } from './logger';
import { TaskExecutor } from './task-executor';

export class InertiaClient {
  private readonly _cli = inject(CLIProgram);
  private readonly _log = inject(Log);
  private readonly _inertiaConfig = inject(InertiaConfig);
  private readonly _taskExecutor = inject(TaskExecutor);

  async init() {
    const programConfig = this._cli.setup();
    const inertiaConfig = this._inertiaConfig.load(programConfig.directory);

    if (inertiaConfig?.tasks) {
      this._taskExecutor.load(programConfig.directory, inertiaConfig.tasks);

      await this._taskExecutor.executeTasks();
    }

    this._log.success('NICE');
  }
}
