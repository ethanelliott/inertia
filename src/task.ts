import { inject } from './inject';
import { Log } from './logger';

import ora from 'ora';
import shelljs from 'shelljs';

export type TaskActionExtras = {
  log: Log;
  shell: typeof shelljs;
  ora: typeof ora;
};

export type TaskAction = (
  resolve: (value: unknown) => void,
  reject: () => void,
  config: Record<string, unknown>,
  other: TaskActionExtras,
) => void;

export type TaskConfig = {
  name: string;
  description: string;
  do: TaskAction;
  config: Record<string, unknown>;
};

export class Task {
  private readonly _log = inject(Log);

  static from(filePath: string) {
    console.log(filePath);

    return new Task();
  }

  private _name;
  private _description;
  private _action;
  private _config;

  constructor(options: TaskConfig) {
    this._name = options.name;
    this._description = options.description;
    this._action = options.do;
    this._config = options.config;
  }

  async run() {
    return await new Promise((resolve, reject) => {
      this._log.log(`Running ${this._name}`);

      if (this._action && typeof this._action === 'function') {
        this._action(resolve, reject, this._config, {
          log: this._log,
          ora: ora,
          shell: shelljs,
        });
      }
    });
  }
}
