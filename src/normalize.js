export default (data) => {
  const feed = {
    posts: [],
  };

  const dataForNormalize = data.querySelector('channel');

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
