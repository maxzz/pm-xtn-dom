export function formatWith(str: string, props: any): string {
    // 0. formatWith("a{b}", {b:"c"}) result:"ac"; formatWith("a{b}c", {d:"d"}); //match:{b} name:b result:"a{b}c"
    return str.replace(/{([\w\$_-]+)}/gm, (match, name) => props[name] || match);
}
let a = '';

/*[aa] <>*/

/*{}*/ a += '_1';
//

/*[what2]{}*/ a += '_2';

//
/*[what]{}*/ a += '_3';

//
/*[all]{*/
a += '_4';
/*[all]}*/

//
/*[all2]{*/
    a += '_5';
/*[all2]}*/

//
/*[all2,all3]{*/
    a += '_6';
/*[all2]}*/


//

/*{*/
    a += '_7';
/*}*/
//
/*[aa]{}*/ /*[bb]{}*/ a += '_8';
//
//
//q1q console.log('qq')
//'never now'
//a1a console.log('aa')

console.log('a', a);