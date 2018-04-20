const utils = (function() {
  const randomInt = max => Math.floor(Math.random() * max);
  const randomItemFrom = arr => arr[randomInt(arr.length)];

  const isObj = arg => typeof arg === 'object' && arg !== null;
  const merge = (obj0, obj1={}) => {
    const keys = new Set([...Object.keys(obj0), ...Object.keys(obj1)]);
    return Object.assign({},
      ...[...keys].map(key => ({[key]:
        !(key in obj1) ? obj0[key]
          : !(key in obj0) ? obj1[key]
          : !isObj(obj0[key]) || !isObj(obj1[key]) ? obj1[key]
          : merge(obj0[key], obj1[key])
      }))
    );
  };
  const range = num => [...Array(num)].map((n, i) => i);

  return {
    randomInt,
    randomItemFrom,
    isObj,
    merge,
    range,
  };
})();
