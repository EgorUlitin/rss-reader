export default (elements, postIds) => {
  const container = elements.posts;

  [...container.querySelectorAll('a')]
    .filter((a) => postIds.includes(a.dataset.id))
    .forEach((a) => {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');
    });
};
