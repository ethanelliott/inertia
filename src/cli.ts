import { program } from 'commander';
import path from 'path';

// @ts-expect-error the relative file path is different once it has been built
import { version } from '../../package.json';

export type Config = {
  directory: string;
};

export class CLIProgram {
  private readonly _program = program
    .name('inertia')
    .description('Easily manage your dotfiles, configs, and setup.')
    .version(version)
    .argument('[string]', 'directory to begin loading from', '.');

  setup() {
    this._program.parse();

    return this._configFrom(program.processedArgs /**, program.opts() */);
  }

  private _configFrom(args: Array<string>): Config {
    const [directory] = args;

    return {
      directory: path.resolve(process.cwd(), directory),
    };
  }
}
