export function quoPck(src: string): string {
    // 0. If has single quotas return as it is, otherwise replace " to ' and add {~} as prefix.
    return /'/.test(src) ? src : `{~}${src.replace(/"/g, '\'')}`;
}

export function quoUnp(src: string): string {
    // 0 Unpack quotas: remove {~} prefix and return back double quotas.
    return /^{~}/.test(src) ? src.slice(3).replace(/'/g, '"') : src;
}
