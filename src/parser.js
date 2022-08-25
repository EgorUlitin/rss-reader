export default (data) => {
  const feed = {
    posts: [],
  };

  const parser = new DOMParser();
  const parsed = parser.parseFromString(data, 'application/xml');
  const parseError = parsed.querySelector('parsererror');

  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }

  const dataForNormalize = parsed.querySelector('channel');

  [...dataForNormalize.children].forEach((item) => {
    switch (item.tagName) {
      case 'item': {
        const title = item.querySelector('title');
        const link = item.querySelector('link');
        const description = item.querySelector('description');

        feed.posts.push({
          title: title.textContent,
          link: link.textContent,
          description: description.textContent,
        });
        break;
      }
      case 'title': {
        feed[item.nodeName] = item.textContent;
        break;
      }
      case 'description': {
        feed[item.nodeName] = item.textContent;
        break;
      }
      default:
        break;
    }
  });

  return feed;
};
