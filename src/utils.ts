import type { ImportFormat, ExportFormat } from "./types";
import { readdirSync, statSync } from "fs";
import { execSync } from "child_process";

export const import_formats: ImportFormat[] = ["ai", "cdr", "vsd", "pdf", "jpg", "jpeg", "png", "gif", "bmp"];
export const export_formats: ExportFormat[] = ["svg", "png", "ps", "eps", "pdf", "emf", "wmf", "xaml"];

/**
 * Find all files with .ai under given directory and its subdirectories
 * @param dir Directory to search
 * @returns Array of absolute paths to all files with .ai extension
 */
export function find_matched(dir: string, formats: ImportFormat[] = ["ai"]): string[] {
    const files = [];
    for (const file of readdirSync(dir)) {
        if (file.startsWith(".")) {
            continue;
        }
        const path = dir + "/" + file;
        if (statSync(path).isDirectory()) {
            files.push(...find_matched(path));
        } else {
            if (formats.includes(file.toLowerCase().split(".").pop() as ImportFormat)) {
                files.push(path);
            }
        }
    }
    return files;
}

/**
 * Check if Inkscape is installed
 * @returns True if Inkscape is installed, false otherwise
 */
export function check_inkscape(): boolean {
    try {
        const output = execSync("inkscape --version");
        return output.toString().match(/\d+\.\d+\.\d+/) !== null;
    } catch (e) {
        return false;
    }
}
