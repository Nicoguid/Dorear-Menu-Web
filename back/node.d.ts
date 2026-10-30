declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  const fs: {
    existsSync: typeof existsSync;
  };
  export default fs;
}

declare module 'node:fs/promises' {
  export function readFile(path: string, encoding: 'utf-8'): Promise<string>;
  export function writeFile(path: string, data: string, encoding: 'utf-8'): Promise<void>;
  export function rename(oldPath: string, newPath: string): Promise<void>;
  export function unlink(path: string): Promise<void>;
  const fsPromises: {
    readFile: typeof readFile;
    writeFile: typeof writeFile;
    rename: typeof rename;
    unlink: typeof unlink;
  };
  export default fsPromises;
}
