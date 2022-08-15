export default (elements, activePost) => {
  const titleModal = elements.modal.querySelector('.modal-title');
  const descriptionModal = elements.modal.querySelector('.modal-body');
  const fullArticleLink = elements.modal.querySelector('a');

  titleModal.innerHTML = activePost.title;
  descriptionModal.innerHTML = activePost.description;
  fullArticleLink.setAttribute('href', activePost.link);
};
