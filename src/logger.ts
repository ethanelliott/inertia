import chalk from 'chalk';

export enum MessageType {
  DEFAULT = 'DEFAULT',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export class Log {
  private static readonly _FORMATS: Record<
    MessageType,
    { fg: string; bg: string }
  > = {
    [MessageType.DEFAULT]: {
      fg: '#ffffff',
      bg: '',
    },
    [MessageType.SUCCESS]: {
      fg: '#26a65b',
      bg: '',
    },
    [MessageType.WARNING]: {
      fg: '#f39c12',
      bg: '',
    },
    [MessageType.ERROR]: {
      fg: '#f22613',
      bg: '',
    },
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
    const f = Log._FORMATS[type];
    return chalk.hex(f.fg).bgHex(f.bg);
  }
}
