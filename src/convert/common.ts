export function normalize_type(type: string): string {
    type = (type.split(".")?.pop() || "").toLowerCase().trim();

    const map: { [key: string]: string } = {
        jpg: "jpeg",
    };

    return map[type] || type;
}
