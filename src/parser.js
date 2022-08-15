// eslint-disable-next-line consistent-return
export default (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xml');
};
