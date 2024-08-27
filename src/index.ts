import path from 'path';
const electronUtil = require('electron-util/node');

export interface Options {
  size?: number;
  failOnError?: boolean;
}
export interface PidIcon {
  pid: number;
  icon: Buffer;
}

// Workaround for https://github.com/electron/electron/issues/9459
const execPath = path.join(electronUtil.fixPathForAsarUnpack(__dirname), 'run');

function getOptions(opts?: Options) {
  return Object.assign(
    {},
    {
      size: 32,
      failOnError: true,
    },
    opts ?? {}
  );
}

/**
 * Find an icon for a running application (by it's PID)
 * @example
 * const { getAppIconByPid } = require('node-mac-app-icon');
 *
 * getAppIconByPid(814, { size: 32 }).then(res => {
 *   console.log(res); // res is a Buffer
 * });
 *
 * @param {number} pid App PID (Process ID)
 * @param {ListOptions} opts
 * @returns {Promise<Buffer>} Buffer containing image data
 */
export async function getAppIconByPid(
  pid: number,
  opts?: Options
): Promise<Buffer> {
  opts = getOptions(opts);
  const { execFile } = require('child_process');
  const { promisify } = require('util');
  const execFileAsync = promisify(execFile);

  const { stdout } = await execFileAsync(
    execPath,
    [pid.toString(), '--size', opts.size!.toString(), '--encoding', 'buffer'],
    { encoding: 'buffer' }
  );
  return stdout;
}

/**
 * Find icons for a list of running apps (by their PIDs)
 * @example
 * const { getAppIconListByPid } = require('node-mac-app-icon');
 *
 * getAppIconListByPid([814, 20134, 503], { size: 512 }).then(res => {
 *   console.log(res); // array of { pid: ..., icon: ... }
 * });
 *
 * @param {number[]} pidArray App PID (Process ID)
 * @param {Options} opts
 * @returns {Promise<ListResult[]>} Buffer containing image data
 */
export async function getAppIconListByPid(
  pidArray: number[],
  opts?: Options
): Promise<PidIcon[]> {
  opts = getOptions(opts);
  const results = await Promise.all(
    pidArray.map(async (pid) => {
      try {
        const icon = await getAppIconByPid(pid, opts);
        return { pid, icon };
      } catch (err) {
        if (opts.failOnError === true) {
          throw err;
        }
        return { pid, icon: null };
      }
    })
  );

  return results.filter((result): result is PidIcon => result.icon !== null);
}
