import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { findDefaultEntry, listCandidateEntries } from "./findEntry"; // adjust path as needed

const mockCwd = path.resolve(process.cwd(), "project");

describe("findDefaultEntry", () => {
  const mockFiles = new Set<string>();

  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
    vi.spyOn(fs, "existsSync").mockImplementation((file) =>
      mockFiles.has(file as string)
    );
    vi.spyOn(fs, "statSync").mockImplementation(
      (file) =>
        ({
          isFile: () => mockFiles.has(file as string),
        } as fs.Stats)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockFiles.clear();
  });

  it("returns null when no files exist", () => {
    expect(findDefaultEntry()).toBeNull();
  });

  it("returns first matching file", () => {
    const candidate = path.join(mockCwd, "index.ts");
    mockFiles.add(candidate);
    expect(findDefaultEntry()).toBe(candidate);
  });

  it("respects custom options", () => {
    const candidate = path.join(mockCwd, "custom", "main.js");
    mockFiles.add(candidate);
    const result = findDefaultEntry({
      dirs: ["custom"],
      names: ["main"],
      extensions: ["js"],
    });
    expect(result).toBe(candidate);
  });
});

describe("listCandidateEntries", () => {
  it("lists all default candidates", () => {
    const entries = listCandidateEntries({ cwd: mockCwd });
    expect(entries).toContain(path.join(mockCwd, "index.ts"));
    expect(entries).toContain(path.join(mockCwd, "core", "main.jsx"));
  });

  it("respects custom options", () => {
    const entries = listCandidateEntries({
      cwd: mockCwd,
      dirs: ["custom"],
      names: ["entry"],
      extensions: ["mjs"],
    });
    expect(entries).toEqual([path.join(mockCwd, "custom", "entry.mjs")]);
  });
});
