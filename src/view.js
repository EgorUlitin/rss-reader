/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const renderList = (posts, i18nInstance) => posts.map((post) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const a = document.createElement('a');
  a.setAttribute('href', post.link);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.classList.add('fw-bold');
  a.dataset.id = post.id;
  a.textContent = post.title;

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.dataset.id = post.id;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = i18nInstance.t('view');

  li.append(a);
  li.append(button);

  return li;
});

const renderModal = (elements, state) => {
  const id = state.modal;
  const activePost = state.data.posts.find((post) => post.id === id);

  const titleModal = elements.modal.querySelector('.modal-title');
  const descriptionModal = elements.modal.querySelector('.modal-body');
  const fullArticleLink = elements.modal.querySelector('a');

  titleModal.textContent = activePost.title;
  descriptionModal.textContent = activePost.description;
  fullArticleLink.setAttribute('href', activePost.link);
};

const renderShownPosts = (elements, postIds) => {
  const container = elements.posts;

  [...container.querySelectorAll('a')]
    .filter((a) => postIds.includes(a.dataset.id))
    .forEach((a) => {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');
    });
};

const renderPosts = (posts, prevPosts, container, i18nInstance) => {
  const difference = posts.length - prevPosts.length;

  if (container.hasChildNodes() && difference !== 0) {
    const newPosts = posts.slice(-difference);
    const listGroup = container.querySelector('ul');
    renderList(newPosts, i18nInstance).forEach((li) => listGroup.append(li));

    return;
  }

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t('posts');

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  renderList(posts, i18nInstance).forEach((li) => listGroup.append(li));

  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(listGroup);

  container.append(card);
};

const renderFeeds = (feeds, container, i18nInstance) => {
  container.textContent = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t('feeds');

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h = document.createElement('h3');
    h.classList.add('h6', 'm-0');
    h.textContent = title;
    li.append(h);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = description;
    li.append(p);

    listGroup.append(li);
  });

  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(listGroup);

  container.append(card);
};

const renderErrors = (elements, value, i18nInstance) => {
  elements.outputError.textContent = i18nInstance.t(value);
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'success':
      elements.submitButton.disabled = false;
      elements.outputError.classList.remove('text-danger');
      elements.outputError.classList.add('text-success');
      elements.input.value = '';
      break;

    case 'error':
      elements.input.classList.add('is-invalid');
      elements.outputError.classList.remove('text-success');
      elements.outputError.classList.add('text-danger');
      elements.submitButton.disabled = false;
      break;

    case 'sending':
      elements.input.classList.remove('is-invalid');
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.input.classList.remove('is-invalid');
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const render = (elements, i18nInstance, state) => (path, value, prevValue) => {
  const target = path.split('.')[1];
  const container = elements[target];

  switch (path) {
    case 'processState':
      handleProcessState(elements, value);
      break;

    case 'data.posts':
      renderPosts(value, prevValue, container, i18nInstance);
      break;

    case 'data.feeds':
      renderFeeds(value, container, i18nInstance);
      break;

    case 'error':
      renderErrors(elements, value, i18nInstance);
      break;

    case 'uiState.shownPosts':
      renderShownPosts(elements, value);
      break;

    case 'modal':
      renderModal(elements, state);
      break;

    default:
      break;
  }
};

// eslint-disable-next-line max-len
export default (state, elements, i18nInstance) => onChange(state, render(elements, i18nInstance, state));
