import { createSpinner } from 'nanospinner';
import { runCommand } from 'src/util/command-runner';
import { inject } from 'src/util/inject';
import { Log } from 'src/util/logger';

import { InertiaPlugin } from '../plugin';

type NodePluginConfig = {
  packages?: Array<string>;
};

export class NodePlugin implements InertiaPlugin {
  private readonly _log = inject(Log);

  id = 'nodejs';

  name = 'NodeJS';

  description = 'Setup NVM and NodeJS';

  async do(config: NodePluginConfig) {
    this._log.info('Node setup');

    const nvmInstalled = (await runCommand('echo $NVM_DIR/nvm.sh')).success;

    if (nvmInstalled) {
      this._log.warn('NVM already installed.');
    } else {
      await this._installNVM();
    }

    const nodeVersionMajor = 23;

    const n = createSpinner(
      `Installing NodeJS v${nodeVersionMajor}...`,
    ).start();
    if (
      (
        await runCommand(
          `/bin/bash -c "source $NVM_DIR/nvm.sh && nvm install ${nodeVersionMajor} && nvm use ${nodeVersionMajor}"`,
        )
      ).success
    ) {
      const nodeVersion = ((await runCommand('node -v'))?.out ?? '')
        .replaceAll('\n', '')
        .trim();
      n.success(`Installed NodeJS ${nodeVersion}`);
    } else {
      n.success(`Failed to install NodeJS v${nodeVersionMajor}`);
    }

    const q = createSpinner(`Updating NPM`).start();
    if (
      (
        await runCommand(
          `/bin/bash -c "source $NVM_DIR/nvm.sh && npm i -g npm"`,
        )
      ).success
    ) {
      const npmVersion = ((await runCommand('npm -v'))?.out ?? '')
        .replaceAll('\n', '')
        .trim();
      q.success(`Updated NPM to ${npmVersion}`);
    } else {
      q.success(`Failed to update NPM`);
    }

    if (config.packages) {
      this._log.info('NPM package installation');

      for (const p of config.packages.filter((e) => e)) {
        await this._installPackage(p);
      }
    }
  }

  private async _installNVM() {
    const o = createSpinner('Installing NVM...').start();

    const command = `/bin/bash -c "$(curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh)"`;

    const ir = await runCommand(command);

    if (ir.success) {
      o.success('NVM installed');
    } else {
      o.success('Failed to install NVM');
    }
  }

  private async _installPackage(p: string) {
    const obi = createSpinner(`Installing package "${p}"`).start();

    const r = await runCommand(`npm i -g ${p}`);

    if (r.success) {
      obi.success(`Successfully installed package "${p}"`);
    } else {
      obi.error(`Failed to install package "${p}"`);
    }
  }
}
