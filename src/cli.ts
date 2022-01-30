import type { ExportFormat } from "./types";
import { program } from "commander";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import convert from "./convert";
import { green, red, yellow, cyan, blue } from "./colors";
import { find_ai, check_inkscape } from "./utils";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8"));

program.version(cyan("piconvert") + " " + yellow("v" + pkg.version) + "\n" + pkg.description);

program
    .argument("[path]", "Input Path. If it's a directory, all AI files in it and its subdirectories will be converted.", "pictures")
    .option("-o, --output <folder>", "Output Folder", "piconvert")
    .option("-f, --formats <formats>", "Output Formats. svg,png,ps,eps,pdf,emf,wmf,xaml", "svg,png")
    .option("-F, --force", "Force Overwrite", false)
    .option("-s, --silent", "Silent Mode", false)
    .action(async (path) => {
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

        path = resolve(path);

        if (!existsSync(path)) {
            console.error(red(`Input path does not exist. \nPath: ${path}`));
            process.exit(1);
        }

        const files = find_ai(path);
        const output = resolve(program.opts().output);
        const formats: ExportFormat[] = program
            .opts()
            .formats.split(",")
            .map((format: string) => {
                const f = format.trim().toLowerCase();
                if ("svg,png,ps,eps,pdf,emf,wmf,xaml".split(",").includes(f)) {
                    return f as ExportFormat;
                } else {
                    return null;
                }
            })
            .filter((format: null | ExportFormat) => format !== null);
        const force = program.opts().force;
        const silent = program.opts().silent;

        for (const file of files) {
            const short = file.replace(path, "");
            silent || console.log(blue(`Converting ${short}`));
            const converted = await convert(file, file.replace(path, output), formats, force, silent);
            silent || !converted || console.log(green(`${short} Converted!`));
        }
    });

program.parse();
