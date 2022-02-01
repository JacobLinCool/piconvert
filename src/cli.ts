import type { ImportFormat, ExportFormat } from "./types";
import { program } from "commander";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import Converter from "./converter";
import { green, red, yellow, cyan, blue, magenta } from "./colors";
import { check_inkscape, export_formats, import_formats } from "./utils";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8"));

program.version(cyan("piconvert") + " " + yellow("v" + pkg.version) + "\n" + pkg.description);

program
    .argument(
        "[path]",
        "Source path. If it's a directory, all files matched selected import types in it and its subdirectories will be converted.",
        "pictures",
    )
    .option("-d, --dir <directory>", "Output directory", "piconvert")
    .option("-i, --inputs <formats>", "Import (input) formats. Supports: " + import_formats.map((f) => yellow(f)).join(","), "ai")
    .option("-o, --outputs <formats>", "Export (output) formats. Supports: " + export_formats.map((f) => yellow(f)).join(","), "svg,png")
    .option("-f, --force", "Overwrite existing files", false)
    .option("-s, --silent", "Silent mode, no output", false)
    .option("-v, --verbose", "Verbose mode, print all Inkscape output", false)
    .action(async (path) => {
        console.log(cyan("piconvert") + " " + yellow("v" + pkg.version));

        path = resolve(path);
        const output_dir = resolve(program.opts().dir);
        const imputs: ImportFormat[] = program
            .opts()
            .inputs.split(",")
            .map((format: string) => {
                const f = format.trim().toLowerCase();
                if (import_formats.includes(f as ImportFormat)) {
                    return f as ImportFormat;
                } else {
                    return null;
                }
            })
            .filter((format: null | ImportFormat) => format !== null);
        const outputs: ExportFormat[] = program
            .opts()
            .outputs.split(",")
            .map((format: string) => {
                const f = format.trim().toLowerCase();
                if (export_formats.includes(f as ExportFormat)) {
                    return f as ExportFormat;
                } else {
                    return null;
                }
            })
            .filter((format: null | ExportFormat) => format !== null);
        const force = program.opts().force;
        const silent = program.opts().silent;
        const verbase = program.opts().verbose;

        if (check_inkscape() === false) {
            console.error(red("Inkscape is not installed."));

            if (process.platform === "linux") {
                console.log("Install via: " + yellow("apt-get install -y inkscape"));
            } else if (process.platform === "darwin") {
                console.log("Install via: " + yellow("brew install --cask inkscape"));
            } else {
                console.log("Install from: " + yellow("https://www.inkscape.org/release/"));
            }

            process.exit(1);
        }

        if (!existsSync(path)) {
            console.error(red(`Input path does not exist. \nPath: ${path}`));
            process.exit(1);
        }

        const converter = new Converter();

        for (const input of imputs) {
            converter.import(input);
        }
        for (const output of outputs) {
            converter.export(output);
        }

        converter.on("conversion-start", (source, dest) => {
            silent || console.log(magenta("[Conversion started] ") + yellow(source) + " -> " + yellow(dest));
        });
        converter.on("conversion-finish", (source, dest) => {
            silent || console.log(magenta("[Conversion finished] ") + yellow(source) + " -> " + yellow(dest));
        });
        converter.on("directory-start", () => {
            silent || console.group();
        });
        converter.on("directory-finish", () => {
            silent || console.groupEnd();
        });
        converter.on("file-start", (source) => {
            silent || console.log(magenta("[File]"), blue(source.replace(path, "").substring(1)));
            silent || console.group();
        });
        converter.on("file-finish", () => {
            silent || console.groupEnd();
        });
        converter.on("task-succeeded", (source, dest, config) => {
            silent ||
                console.log(
                    green("[Succeeded]"),
                    cyan(config.format + " " + (config.width || "") + (config.width || config.height ? "x" : "") + (config.height || "")),
                );
        });
        converter.on("task-failed", (source, dest, config) => {
            silent ||
                console.log(
                    red("[Failed]"),
                    cyan(config.format + " " + (config.width || "") + (config.width || config.height ? "x" : "") + (config.height || "")),
                );
        });
        converter.on("task-skipped", (source, dest, config) => {
            silent ||
                console.log(
                    yellow("[Skipped]"),
                    cyan(config.format + " " + (config.width || "") + (config.width || config.height ? "x" : "") + (config.height || "")),
                );
        });

        converter.run(path, output_dir, true, force, verbase);
    });

program.parse();
