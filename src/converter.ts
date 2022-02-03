import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import EventEmitter from "events";
import yaml from "js-yaml";
import { convert, from_svg, to_svg } from "./convert";
import { Config, ConverterEvent, ExportFormat, ImportFormat, OutputConfig } from "./types";

export class Converter extends EventEmitter {
    private imports: ImportFormat[] = [];
    private exports: OutputConfig = {};

    /**
     * @param event Converter event name
     * @param args Arguments for the event
     */
    public emit(event: ConverterEvent, ...args: unknown[]): boolean {
        return super.emit(event, ...args);
    }

    /**
     * @param event Converter event name
     * @param listener Listener function
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public on(event: ConverterEvent, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Inner Convert Function
     * @param svg SVG string
     * @param source Absolute path to source file
     * @param dir Absolute path to the destination directory
     * @param config Configuration object
     * @param verbose Whether to print Inkscape output
     */
    private async convert(svg: string, source: string, dir: string, config: Config, verbose = false): Promise<void> {
        this.emit("task-start", source, dir, config);
        try {
            const dest = resolve(
                dir,
                `${basename(source.split(".").slice(0, -1).join("."))}${
                    config.width || config.height ? `.${config.width || ""}x${config.height || ""}` : ""
                }.${config.format}`,
            );

            if (config.force || !existsSync(dest)) {
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                }

                const converted = await from_svg(svg, config.format, config.width, config.height, verbose);
                writeFileSync(dest, converted);

                this.emit("task-succeeded", source, dir, config);
            } else {
                this.emit("task-skipped", source, dir, config);
            }
        } catch (err) {
            if (verbose) {
                console.error(err);
            }
            this.emit("task-failed", source, dir, config);
        }
    }

    /**
     * Convert picture file to given formats
     * @param source Absolute path to source file
     * @param dir Absolute path to the destination directory
     * @param parent_config Configuration object
     * @param force Whether to force conversion and overwrite existing files
     * @param verbose Whether to print Inkscape output
     */
    async convert_file(source: string, dir: string, parent_config: OutputConfig, force = false, verbose = false): Promise<void> {
        this.emit("file-start", source, dir, parent_config, force, verbose);
        const file_config_name = resolve(dirname(source), source.split(".").slice(0, -1).join("."));

        const file_config_path = existsSync(file_config_name + ".yml")
            ? file_config_name + ".yml"
            : existsSync(file_config_name + ".yaml")
            ? file_config_name + ".yaml"
            : null;

        let file_config: OutputConfig = parent_config;

        if (file_config_path) {
            file_config = yaml.load(readFileSync(file_config_path, "utf8")) as OutputConfig;
        }

        const formats = Object.keys(file_config) as ExportFormat[];

        const configs: Config[] = [];

        for (const format of formats) {
            const sizes = file_config[format] as (number | string)[] | null;

            if (sizes) {
                for (const size of sizes) {
                    const width = typeof size === "number" ? size : parseInt(size.split("x")[0]) || 0;
                    const height = typeof size === "number" ? size : parseInt(size.split("x")[1]) || 0;

                    configs.push({ format, width, height, force });
                }
            } else {
                configs.push({ format, width: 0, height: 0, force });
            }
        }

        const svg = to_svg(source, verbose);

        for (const config of configs) {
            await this.convert(svg, source, dir, config, verbose);
        }

        this.emit("file-finish", source, dir, parent_config, force, verbose);
    }

    /**
     * Convert all matched picture files in given directory to given formats
     * @param source Absolute path to source directory
     * @param dir Absolute path to the destination directory
     * @param types Array of file types to convert
     * @param parent_config Configuration object
     * @param force Whether to force conversion and overwrite existing files
     * @param verbose Whether to print Inkscape output
     * @param recursive Whether to recursively convert files in subdirectories
     */
    async convert_directory(
        source: string,
        dir: string,
        types: ImportFormat[],
        parent_config: OutputConfig,
        force = false,
        verbose = false,
        recursive = true,
    ): Promise<void> {
        this.emit("directory-start", source, dir, types, parent_config, force, verbose, recursive);
        const children = readdirSync(source);
        const files = children
            .filter((file) => statSync(resolve(source, file)).isFile())
            .filter((file) => types.includes(file.split(".").pop()?.toLowerCase() as ImportFormat));
        const directories = children.filter((file) => statSync(resolve(source, file)).isDirectory());

        const folder_config_path = existsSync(resolve(source, "piconvert.yml"))
            ? resolve(source, "piconvert.yml")
            : existsSync(resolve(source, "piconvert.yaml"))
            ? resolve(source, "piconvert.yaml")
            : existsSync(resolve(source, ".piconvert.yml"))
            ? resolve(source, ".piconvert.yml")
            : existsSync(resolve(source, ".piconvert.yaml"))
            ? resolve(source, ".piconvert.yaml")
            : null;

        let folder_config: OutputConfig = parent_config;

        if (folder_config_path) {
            folder_config = yaml.load(readFileSync(folder_config_path, "utf8")) as OutputConfig;
        }

        for (const file of files) {
            await this.convert_file(resolve(source, file), dir, folder_config, force, verbose);
        }

        this.emit("directory-finish", source, dir, types, parent_config, force, verbose, recursive);

        if (recursive) {
            const subdirs = directories.filter((dir) => dir[0] && dir[0] !== ".").map((dir) => resolve(source, dir));
            for (const subdir of subdirs) {
                await this.convert_directory(subdir, resolve(dir, basename(subdir)), types, folder_config, force, verbose, recursive);
            }
        }
    }

    /**
     * @param format Format to convert to
     * @param sizes Array of sizes to convert to example: `128`, `128x64`, `x64`, `128x`
     * @returns this
     * @example
     * ```
     * .export("svg", [128, "128x64"])
     * ```
     */
    export(format: ExportFormat, sizes: (number | string)[] | null = null): this {
        this.exports[format] = sizes;
        return this;
    }

    /**
     * Clear all previous set export formats
     * @returns this
     */
    clear_exports(): this {
        this.exports = {};
        return this;
    }

    /**
     * @param format Format to match
     * @returns this
     */
    import(format: ImportFormat): this {
        this.imports.push(format);
        return this;
    }

    /**
     * Clear all previous set import formats
     */
    clear_imports(): this {
        this.imports = [];
        return this;
    }

    /**
     * Execute the conversion
     * @param source Path to source directory
     * @param dest Path to destination directory
     * @param recursive Whether to recursively convert files in subdirectories
     * @param force Whether to force conversion and overwrite existing files
     * @param verbose Whether to print Inkscape output
     */
    async run(source: string, dest: string, recursive = true, force = false, verbose = false): Promise<void> {
        source = resolve(source);
        dest = resolve(dest);
        this.emit("conversion-start", source, dest);

        if (existsSync(source)) {
            if (statSync(source).isDirectory()) {
                await this.convert_directory(source, dest, this.imports, this.exports, force, verbose, recursive);
            } else {
                await this.convert_file(source, dest, this.exports, force, verbose);
            }
        }

        this.emit("conversion-finish", source, dest);
    }
}

export declare interface Converter {
    on(event: "conversion-start", listener: (source: string, dest: string) => void): this;
    on(event: "conversion-finish", listener: (source: string, dest: string) => void): this;
    on(
        event: "directory-start",
        listener: (
            source: string,
            dest: string,
            types: ImportFormat[],
            config: OutputConfig,
            force: boolean,
            verbose: boolean,
            recursive: boolean,
        ) => void,
    ): this;
    on(
        event: "directory-finish",
        listener: (
            source: string,
            dest: string,
            types: ImportFormat[],
            config: OutputConfig,
            force: boolean,
            verbose: boolean,
            recursive: boolean,
        ) => void,
    ): this;
    on(event: "file-start", listener: (source: string, dest: string, config: OutputConfig, force: boolean, verbose: boolean) => void): this;
    on(
        event: "file-finish",
        listener: (source: string, dest: string, config: OutputConfig, force: boolean, verbose: boolean) => void,
    ): this;
    on(event: "task-start", listener: (source: string, dest: string, config: Config) => void): this;
    on(event: "task-succeeded", listener: (source: string, dest: string, config: Config) => void): this;
    on(event: "task-skipped", listener: (source: string, dest: string, config: Config) => void): this;
    on(event: "task-failed", listener: (source: string, dest: string, config: Config) => void): this;
}

export default Converter;
