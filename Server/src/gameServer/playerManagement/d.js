const d = [{name: 'foo'},{name: 'bar'}]
const dc = d.filter(c => c.name === 'foo');
dc[0].name= "hai";
console.log(dc);
console.log(d);