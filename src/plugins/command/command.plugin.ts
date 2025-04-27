import { exec } from 'child_process';
import { createSpinner } from 'nanospinner';
import { inject } from 'src/util/inject';
import { Log } from 'src/util/logger';

import { InertiaPlugin } from '../plugin';

export class CommandPlugin implements InertiaPlugin {
  private readonly _log = inject(Log);

  id = 'command';

  name = 'Command';

  description = 'Run a command';

  async do() {
    const o = createSpinner('Running command...').start();

    try {
      await new Promise<void>((resolve, reject) => {
        exec(``, (err, stdout, stderr) => {
          if (err) {
            console.log(stderr);
            reject(err);
          }
          console.log(stdout);
          resolve();
        });
      });
    } catch (err) {
      o.error('Command failed to run');
      this._log.error(`${err}`);
      return;
    }

    o.success('Command executed successfully');
  }
}
