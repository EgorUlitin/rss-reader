// eslint-disable-next-line consistent-return
export default (data) => {
  try {
    const parser = new DOMParser();
    return parser.parseFromString(data, 'application/xml');
  } catch (e) {
    console.log(e, 'Ошибка парсинга');
  }
};
