export default (data) => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(data, 'application/xml');
  const parseError = parsed.querySelector('parsererror');

  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  const dataForNormalize = parsed.querySelector('channel');

  const title = dataForNormalize.querySelector('title');

  const description = dataForNormalize.querySelector('description');

  const itemNodes = dataForNormalize.querySelectorAll('item');
  const items = [...itemNodes].map((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const itemDescription = item.querySelector('description');

    return {
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
    };
  });

  return { title: title.textContent, description: description.textContent, posts: items };
};
