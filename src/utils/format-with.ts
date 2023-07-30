export function formatWith(str: string, props: any): string {
	// 0. formatWith("a{b}", {b:"c"}) result:"ac"; formatWith("a{b}c", {d:"d"}); //match:{b} name:b result:"a{b}c"
	return str.replace(/{([\w\$_-]+)}/gm, (match, name) => props[name] || match);
}

/*{}*/ console.log('aa')
//
function aa() {
/*[what2]{}*/ console.log('what2')
}
//
/*[what]{}*/ console.log('what')

//
/*[all]{*/
	console.log('block 1')
/*[all]}*/

//

/*[all2]{*/
	console.log('block 2')
/*[all2]}*/

//

/*{*/
	console.log('block 3')
/*}*/
//
//
//
//q1q console.log('qq')
//'never now'
//a1a console.log('aa')
