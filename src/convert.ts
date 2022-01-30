import type { ExportFormat } from "./types";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve, basename, dirname } from "path";
import { green, red, yellow } from "./colors";

/**
 * Convert AI file to given formats
 * @param source Absolute Path to the source AI file
 * @param dist Absolute Path to the destination file
 * @param formats Array of export formats
 * @param force Overwrite existing files?
 * @param silent Silent mode?
 */
export default async function convert(
    source: string,
    dist: string,
    formats: ExportFormat[],
    force: boolean,
    silent: boolean,
    verbase: boolean,
): Promise<boolean> {
    const converters = formats.map((format) => {
        const options = ["--export-area-page", `--export-type=${format}`];

        if (format === "svg") {
            options.push("--export-plain-svg");
        }

        return { options, format };
    });

    await Promise.all(
        converters.map(async (converter) => {
            const output_dir = dirname(dist);
            if (!existsSync(output_dir)) {
                mkdirSync(output_dir, { recursive: true });
            }
            const output = resolve(output_dir, `${basename(source).replace(/\..+$/, "")}.${converter.format}`);

            if (force || !existsSync(output)) {
                try {
                    execSync(
                        `${process.env.SUDO_UID ? "sudo " : ""}inkscape "${source.replace(/(?<!\\)"/g, '\\"')}" ${converter.options.join(
                            " ",
                        )} -o "${output.replace(/(?<!\\)"/g, '\\"')}"`,
                        {
                            stdio: verbase ? "inherit" : "ignore",
                        },
                    );
                    silent || console.log(green(`    -> ${converter.format} Success!`));
                } catch (e) {
                    silent || console.error(red(`    -> ${converter.format} Failed.`));
                    return false;
                }
            } else {
                silent || console.log(yellow(`    -> ${converter.format} Skip.`));
            }

            return true;
        }),
    );

    return true;
}
