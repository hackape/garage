// glitch text effect from https://musicforprogramming.net/

var things = ['coding','knitting','drawing','drawing','drawing','drawing','drawing','designing','planning','writing','writing','writing','writing','writing','writing','writing','programming','programming','programming','programming','programming','concluding','programming','thinking','painting','painting','painting','painting','painting','sewing','sketching','ruminating','deliberating','pondering','contemplating','abstracting','abstracting','abstracting','abstracting','abstracting','abstracting','optimising','optimising','optimising','optimising','optimising','optimising','refactoring','refactoring','refactoring','objectifying','simplifying','decoupling','debugging','debugging','debugging','debugging','debugging','debugging','configuring','streamlining','searching','tweaking','editing'];
var junk = ['#','@','%','*','&amp;','&lt;','&gt;','_','=','+','[',']','|','-','!','?','X'];

function randomInt(min, max) {
  return Math.round(min + (Math.random() * (max-min)));
}

function tick(selector) {
  var box = document.querySelector(selector);
  if (!box) return;
  var txt = things[randomInt(0, things.length-1)];
  var chars = txt.split('');
  var glitch = randomInt(0, 3);
  for (var i = 0; i < glitch; i++)
  {
    chars[randomInt(0, chars.length-1)] = junk[randomInt(0, junk.length-1)];
  }
  txt = chars.join('');
  box.textContent = txt;
  window.setTimeout(tick.bind(null, selector), randomInt(16,400));
}
