import { existsSync } from 'fs';
import { basename, join } from 'path';
import { inject } from './inject';
import { Log } from './logger';
import chalk from 'chalk';
import { cp, ln, rm } from 'shelljs';

export type InertiaFileConfig = {
  inertiaDirectory: string;
  linksDirectory: string;
  linkFilePath: string;
  linkFileName: string;
  fileName: string;
  relativeFilePath: string;
};

export class InertiaFile {
  static from(directory: string, linksDirectory: string, linkFilePath: string) {
    const linkFileName = basename(linkFilePath);
    const fileName = linkFileName.replace('.link', '');
    const relativeFilePath = linkFilePath
      .replace(linksDirectory, '')
      .replace('.link', '');

    return new InertiaFile({
      inertiaDirectory: directory,
      linksDirectory,
      linkFilePath,
      linkFileName,
      fileName,
      relativeFilePath,
    });
  }

  private readonly _log = inject(Log);

  constructor(public config: InertiaFileConfig) {}

  link(destinationPath: string, backup: boolean) {
    const source = this.config.linkFilePath;
    const name = this.config.fileName;
    const destination = join(destinationPath, this.config.relativeFilePath);

    try {
      this._symlink(source, destination, backup);
    } catch {
      this._log.error(`Failed to symlink "${name}"`);
    }
  }

  private _backup(file: string) {
    if (existsSync(file)) {
      const backup = `${file}.bak`;
      this._log.log(
        `Backing up "${chalk.blue(file)}" to "${chalk.blue(backup)}"`,
      );
      cp('-rf', file, backup);
      rm('-rf', file);
    }
  }

  private _restore(file: string) {
    const backup = `${file}.bak`;
    if (existsSync(backup)) {
      this._log.log(`Putting original back ${file}`);
      cp('-rf', backup, file);
      this._log.log(`Removing symlink backup from ${file}.bak`);
      rm('-rf', backup);
    }
  }

  private _symlink = (source: string, file: string, backup: boolean) => {
    this._log.log(
      `Symlinking "${chalk.blue(source)}" to "${chalk.blue(file)}"`,
    );

    if (backup) this._backup(file);
    const result = ln('-sf', source, file);
    if (result.code !== 0) {
      if (backup) this._restore(file);
      throw new Error(result.stderr);
    }
  };
}
