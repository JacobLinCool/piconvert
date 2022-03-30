import { from_svg } from "./from_svg";
import { to_svg } from "./to_svg";

async function convert(
    src: string,
    to: string,
    width: number | null,
    height: number | null,
    verbose = false,
): Promise<Buffer> {
    const svg = to_svg(src, verbose);
    return await from_svg(svg, to, width, height, verbose);
}

export * from "./common";
export { convert, to_svg, from_svg };
