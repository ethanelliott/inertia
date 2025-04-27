import { exec } from 'child_process';

export async function runCommand(command: string, output?: boolean) {
  try {
    const result = await new Promise<string>((resolve, reject) => {
      exec(command, (err, stdout) => {
        if (err) {
          reject(err);
        }
        resolve(stdout);
        if (output) {
          console.log(stdout);
        }
      });
    });

    return { success: true, out: result };
  } catch (err) {
    console.error(err);

    return { success: false, error: err };
  }
}
