import { execSync } from "node:child_process";
import sharp from "sharp";
import { normalize_type } from "./common";

const sharp_supported_types = ["jpeg", "png", "webp", "gif", "avif", "tiff"] as const;
type SharpFormat = typeof sharp_supported_types[number];
const inkscape_supported_types = ["svg", "png", "ps", "eps", "pdf", "emf", "wmf", "xaml"] as const;
type InkscapeFormat = typeof inkscape_supported_types[number];

/**
 * Convert SVG to File Buffer
 * @param svg
 * @param type
 * @param width
 * @param height
 * @param verbose
 * @returns
 */
export async function from_svg(
    svg: string,
    type: string,
    width: number | null,
    height: number | null,
    verbose = false,
): Promise<Buffer> {
    type = normalize_type(type);
    const label = `svg -> ${type} ${width || ""}x${height || ""}`;

    if (verbose) {
        console.log(`Normalized Type: ${type}`);
        console.time(label);
    }

    let output: Buffer;
    if (["svg"].includes(type)) {
        output = Buffer.from(svg);
    } else if (sharp_supported_types.includes(type as SharpFormat)) {
        verbose && console.log("Use: sharp");
        const img = sharp(Buffer.from(svg));

        if (width === null || width <= 0) {
            width = null;
        }
        if (height === null || height <= 0) {
            height = null;
        }
        if (width || height) {
            img.resize(width, height);
        }

        output = await img[type as SharpFormat]().toBuffer();
    } else if (inkscape_supported_types.includes(type as InkscapeFormat)) {
        verbose && console.log("Use: inkscape");
        const options = ["--export-area-page", `--export-type ${type}`];

        if (width !== null && width > 0) {
            options.push(`--export-width ${width}`);
        }
        if (height !== null && height > 0) {
            options.push(`--export-height ${height}`);
        }

        output = execSync(`inkscape --pipe ${options.join(" ")} --export-filename -`, {
            input: svg,
            stdio: "pipe",
        });
    } else {
        throw new Error(`Unsupported file type: ${type}`);
    }

    if (verbose) {
        console.timeEnd(label);
    }

    return output;
}
