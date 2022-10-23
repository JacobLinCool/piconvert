import { spawn } from "node:child_process";
import { OptimizedSvg, optimize } from "svgo";
import { normalize_type } from "./common";

const inkscape_supported_types = [
    "ai",
    "cdr",
    "vsd",
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
] as const;
type InkscapeFormat = typeof inkscape_supported_types[number];

/**
 * Convert File Buffer to SVG
 * @param source Absolute path to source file
 * @param verbose Verbose mode
 * @returns SVG string
 */
export async function to_svg(source: string, verbose = false): Promise<string> {
    const type = normalize_type(source);
    const label = `${type} -> svg`;

    if (verbose) {
        console.log(`Normalized Type: ${type}`);
        console.time(label);
    }

    let output = "";
    if (inkscape_supported_types.includes(type as InkscapeFormat)) {
        const child = spawn("inkscape", [
            "--pipe",
            "--export-plain-svg",
            "--pdf-poppler",
            "--export-type",
            "svg",
            "--export-filename",
            "-",
            source,
        ]);

        child.stdout.on("data", (data: Buffer) => (output += data.toString()));
        await new Promise((resolve) => child.on("close", () => resolve(output)));
    } else {
        throw new Error(`Unsupported file type: ${type}`);
    }

    const optimized = optimize(output, { multipass: true }) as OptimizedSvg;

    if (verbose) {
        console.timeEnd(label);
    }

    return optimized.data;
}
