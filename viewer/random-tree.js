const RandomTree = (function() {
  const defaults = {
    numNodes: 20,
    xSize: {
      min: 20,
      max: 70,
    },
    ySize: {
      min: 30,
      max: 80,
    },
  };

  const RandomTree = options => {
    const opts = utils.merge(defaults, options);

    const randomSizer = sz => () => utils.randomInt(sz.max - sz.min) + sz.min;
    const randomXSize = randomSizer(opts.xSize);
    const randomYSize = randomSizer(opts.ySize);
    const randomHue = () => utils.randomInt(360);
    const randomNode = id => ({
      id,
      size: [randomXSize(), randomYSize()],
      children: [],
      hue: randomHue(),
    });

    const dataNodes = utils.range(opts.numNodes).reduce((acc, id) => {
      const dataNode = randomNode(id);
      if (acc.length > 0) {
        const parent = utils.randomItemFrom(acc);
        parent.children.push(dataNode);
      }
      return acc.concat(dataNode);
    }, []);
    return dataNodes[0];
  };
  return RandomTree;
})();
