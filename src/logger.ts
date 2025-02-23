import chalk from 'chalk';

export enum MessageType {
  DEFAULT = 'DEFAULT',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export class Log {
  private static readonly _FORMATS: Record<MessageType, any> = {
    [MessageType.DEFAULT]: chalk.reset,
    [MessageType.SUCCESS]: chalk.green,
    [MessageType.WARNING]: chalk.yellow,
    [MessageType.ERROR]: chalk.red,
  };

  log(message: string) {
    this._log(message, MessageType.DEFAULT);
  }

  success(message: string) {
    this._log(message, MessageType.SUCCESS);
  }

  error(message: string) {
    this._log(message, MessageType.ERROR);
  }

  warn(message: string) {
    this._log(message, MessageType.WARNING);
  }

  private _log(message: string, type: MessageType) {
    console.log(this._format(type)(message));
  }

  private _format(type: MessageType) {
    return Log._FORMATS[type];
  }
}
