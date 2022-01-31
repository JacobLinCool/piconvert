export type ExportFormat = "svg" | "png" | "ps" | "eps" | "pdf" | "emf" | "wmf" | "xaml";
export type ImportFormat = "ai" | "cdr" | "vsd" | "pdf" | "jpg" | "jpeg" | "png" | "gif" | "bmp";

export interface Config {
    format: ExportFormat;
    width: number;
    height: number;
    force: boolean;
}

export type OutputConfig = {
    [key in ExportFormat]?: (number | string)[] | null;
};

export type ConverterEvent =
    | "conversion-start"
    | "conversion-finish"
    | "directory-start"
    | "directory-finish"
    | "task-start"
    | "task-succeeded"
    | "task-skipped"
    | "task-failed";
