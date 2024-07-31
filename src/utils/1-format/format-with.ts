export function formatWith(str: string, props: any): string {
    // 0. formatWith("a{b}", {b:"c"}) result:"ac"; formatWith("a{b}c", {d:"d"}); //match:{b} name:b result:"a{b}c"
    
    return str.replace(/{([\w\$_-]+)}/gm, (match, name) => props[name] || match);
}
