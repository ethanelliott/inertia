import { CLIProgram } from './cli';
import { InertiaConfig } from './inertia-config';
import { inject } from './inject';
import { Log } from './logger';

export class InertiaClient {
  private readonly _cli = inject(CLIProgram);
  private readonly _inertiaConfig = inject(InertiaConfig);
  private readonly _log = inject(Log);

  async init() {
    const programConfig = this._cli.setup();
    console.log(programConfig);

    const inertiaConfig = this._inertiaConfig.load(programConfig.directory);

    console.log(inertiaConfig);

    this._log.success('NICE');
  }
}
