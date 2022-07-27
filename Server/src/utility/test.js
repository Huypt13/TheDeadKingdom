let a = { tank: null, startTank: null };
let tank = { b: { c: 7 } }
a.startTank = { ...tank };
a.tank = { ...tank };
console.log("start tank", a.startTank.b.c);
a.tank.b.c = 0.2;
console.log("start tank 1", a.startTank.b.c);

let x = { tank: null, startTank: null };
let tank1 = { b: 7 }
x.startTank = { ...tank1 };
x.tank = { ...tank1 };
console.log("start tank", x.startTank.b);
x.tank.b = 0.2;
console.log("start tank 1", x.startTank.b);