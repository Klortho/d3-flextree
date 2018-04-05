export const urlOpts = url => {
  const qi = url.indexOf('?');
  if (qi === -1) return {};
  const pairs = url.substr(qi + 1).split('&').map(s => s.split('='));
  return Object.assign({},
    ...pairs.map(pair => (
      {[pair[0]]: pair.length > 1 ? pair[1] : true}
    ))
  );
};
