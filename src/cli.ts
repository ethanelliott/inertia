import { program } from 'commander';
import path from 'path';

export type Config = {
  directory: string;
};

export class CLIProgram {
  private readonly _program = program
    .name('inertia')
    .description('Easily manage your dotfiles, configs, and setup.')
    .version('0.0.1')
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
