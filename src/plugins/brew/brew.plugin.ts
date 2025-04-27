import { createSpinner } from 'nanospinner';
import shell from 'shelljs';
import { runCommand } from 'src/util/command-runner';
import { inject } from 'src/util/inject';
import { Log } from 'src/util/logger';

import { InertiaPlugin } from '../plugin';

type BrewPluginConfig = {
  packages: Array<string>;
};

export class BrewPlugin implements InertiaPlugin {
  private readonly _log = inject(Log);

  id = 'homebrew';

  name = 'Homebrew';

  description = 'Setup Homebrew and install packages and casks';

  async do(config: BrewPluginConfig) {
    this._log.info('Homebrew setup');

    if (shell.which('brew')) {
      this._log.warn('Homebrew already installed');
    } else {
      const o = createSpinner('Installing homebrew...').start();

      const ir = await runCommand(
        `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`,
      );
      if (ir.success) {
        o.success('Homebrew installed');
      } else {
        o.success('Failed to install homebrew');
      }

      this._log.info('Installing build-essential...');

      await runCommand(`sudo apt-get install build-essential`, true);

      await runCommand(`brew doctor`);
    }

    if (config.packages) {
      this._log.info('Homebrew package installation');
      for (const p of config.packages.filter((e) => e)) {
        await this._installPackage(p);
      }
    }
  }

  private async _installPackage(p: string) {
    const obi = createSpinner(`Installing package "${p}"`).start();

    const r = await runCommand(`brew install ${p}`);

    if (r.success) {
      obi.success(`Successfully installed package "${p}"`);
    } else {
      obi.error(`Failed to install package "${p}"`);
    }
  }
}
