export interface CliOptions {
  extensions: string;
  verbose?: boolean;
}

export type Graph = Map<string, string[]>;

export interface BuildOptions {
  extensions: string[];
  verbose?: boolean;
  cwd?: string; // base for relative paths; defaults to process.cwd()
  logger?: {
    warn: (...args: unknown[]) => void;
    debug?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
}
