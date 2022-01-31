import type { ImportFormat, ExportFormat } from "./types";
import { execSync } from "child_process";

export const import_formats: ImportFormat[] = ["ai", "cdr", "vsd", "pdf", "jpg", "jpeg", "png", "gif", "bmp"];
export const export_formats: ExportFormat[] = ["svg", "png", "ps", "eps", "pdf", "emf", "wmf", "xaml"];

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
