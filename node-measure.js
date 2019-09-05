const { PerformanceObserver, performance } = require('perf_hooks');

function measure(fn, times) {
  if (!times) times = 1;
  const wrapped = performance.timerify(fn);
  const obs = new PerformanceObserver((list) => {
    const durations = list.getEntries().map(entry => entry.duration);
    const total = durations.reduce((a, b) => a + b);
    const average = (total / durations.length).toFixed(3);
    console.log(average);
  });
  obs.observe({ entryTypes: ['function'], buffered: true });
  var i = 0;
  while (i < times) {
    i++;
    wrapped();
  }
  obs.disconnect();
}
