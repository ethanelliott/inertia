import { CLIProgram } from './cli';
import { DotFiles } from './files/dot-files';
import { InertiaConfig } from './inertia-config';
import { TaskExecutor } from './tasks/task-executor';
import { inject } from './util/inject';
import { Log } from './util/logger';

export class InertiaClient {
  private readonly _log = inject(Log);
  private readonly _cli = inject(CLIProgram);
  private readonly _inertiaConfig = inject(InertiaConfig);
  private readonly _dotFiles = inject(DotFiles);
  private readonly _taskExecutor = inject(TaskExecutor);

  async init() {
    const programConfig = this._cli.setup();
    const inertiaConfig = this._inertiaConfig.load(programConfig.directory);

    this._log.info(`Starting inertia for "${inertiaConfig?.name}"`);

    this._log.info(`Linking...`);
    if (inertiaConfig?.links) {
      this._dotFiles.load(programConfig.directory, inertiaConfig.links);

      await this._dotFiles.execute();
    }

    this._log.info(`Running tasks...`);
    if (inertiaConfig?.tasks) {
      this._taskExecutor.load(programConfig.directory, inertiaConfig.tasks);

      await this._taskExecutor.executeTasks();
    }
  }
}
