// //overrides metamask v0.2 for our 1.0 version.  
//1.0 lets us use async and await instead of promises

import Web3 from 'web3';
var web3 = window.web3;
//overrides metamask v0.2 for our v 1.0
if(typeof web3 !== 'undefined'){
	console.log(web3);
	web3 = new Web3(window.web3.currentProvider);
}else{
	var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')

    web3 = new Web3(provider)
}
console.log(web3);
export default web3;