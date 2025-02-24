import { CLIProgram } from './cli';
import { DotFiles } from './dot-files';
import { InertiaConfig } from './inertia-config';
import { inject } from './inject';
import { TaskExecutor } from './task-executor';

export class InertiaClient {
  private readonly _cli = inject(CLIProgram);
  private readonly _inertiaConfig = inject(InertiaConfig);
  private readonly _dotFiles = inject(DotFiles);
  private readonly _taskExecutor = inject(TaskExecutor);

  async init() {
    const programConfig = this._cli.setup();
    const inertiaConfig = this._inertiaConfig.load(programConfig.directory);

    if (inertiaConfig?.links) {
      this._dotFiles.load(programConfig.directory, inertiaConfig.links);

      await this._dotFiles.execute();
    }

    if (inertiaConfig?.tasks) {
      this._taskExecutor.load(programConfig.directory, inertiaConfig.tasks);

      await this._taskExecutor.executeTasks();
    }
  }
}
