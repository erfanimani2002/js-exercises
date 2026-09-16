console.log('Happy developing ✨')
const sheglam = 1500;
const cosrx = 3000;
const rhode = 3200;

const balance = 15000

const orderd = sheglam + cosrx + rhode*2;
console.log("total price: " , orderd);

const averageprice = orderd / 4;
console.log("averageprice" , averageprice);

const discount   = 0.95;
const finalprice = orderd *  discount;
console.log("finalprice" , finalprice);

const canbuy = balance >= finalprice;
console.log("can buy ?", canbuy);

const message = canbuy ?"yes you can buy" : "no you cant buy" ;
console.log(message);