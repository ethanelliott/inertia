import inquirer from 'inquirer';
import ora from 'ora';
import { join } from 'path';
import { find } from 'shelljs';
import { InertiaFile } from './file';
import { InertialLinksConfigSchema } from '../inertia-config';
import { inject } from '../util/inject';
import { Log } from '../util/logger';

import { homedir } from 'os';

export class DotFiles {
  private readonly _log = inject(Log);

  private readonly _files: Array<InertiaFile> = [];

  private _config!: InertialLinksConfigSchema;

  async load(directory: string, links: InertialLinksConfigSchema) {
    this._config = links;

    const linksDir = join(directory, links.directory ?? './links');

    const tr = ora(`Searching for files under ${linksDir}`).start();

    const filePaths = find(linksDir).filter((f) => f.match(/\.link$/));

    tr.succeed(
      `Found ${filePaths.length} file${filePaths.length === 1 ? '' : 's'}`,
    );

    this._files.push(
      ...filePaths.map((filePath) =>
        InertiaFile.from(directory, linksDir, filePath),
      ),
    );
  }

  async execute() {
    if (this._files.length === 0) {
      this._log.error('No files to symlink...');
      return;
    }

    const mergedConfigs = await this._symlinkConfig();

    this._log.info(`Symlinking...`);

    for (const file of this._files) {
      file.link(mergedConfigs.target, mergedConfigs.backup);
    }

    this._log.info(`Finished symlinking!`);
  }

  private async _symlinkConfig() {
    const prompts = [];

    if (this._config.target === undefined) {
      prompts.push({
        type: 'input',
        name: 'target',
        message: 'Where would you like to symlink your dotfiles to?',
        default: homedir(),
      });
    }

    if (this._config.backup === undefined) {
      prompts.push({
        type: 'confirm',
        name: 'backup',
        message: 'Would you like to back up the current dotfiles?',
        default: true,
      });
    }

    const config = await inquirer.prompt(prompts as any);

    const mergedConfigs = {
      ...this._config,
      ...config,
    } as Required<InertialLinksConfigSchema>;
    return mergedConfigs;
  }
}
