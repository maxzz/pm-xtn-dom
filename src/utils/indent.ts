export function removeIndent(src: string, all: boolean): string {
    // 1. if defined all then remove all indentation from each line
    if (all) {
        return src.replace(/^[^\S\n]+/gm, '');
    }

    // 2. remove the shortest leading indentation from each line
    const match = src.match(/^[^\S\n]*(?=\S)/gm);
    const indent = match && Math.min(...match.map(el => el.length));
    if (indent) {
        const regexp = new RegExp(`^.{${indent}}`, 'gm');
        return src.replace(regexp, '');
    }
    return src;
}

export function addIndent(src: string, indent: string): string {
    return src.replace(/^([^\S\n]*)/gm, function (match, p1) {
        return indent + p1;
    });
}

export function removeFirstIndent(src: string): string {
    return src.replace(/^[^\S]+/, '');
}
