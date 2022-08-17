/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import parser from './parser.js';

export const updatePosts = (watchedState, delay) => {
  setTimeout(() => {
    if (watchedState.addedFeeds.length !== 0) {
      watchedState.addedFeeds.forEach((link) => {
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
          .then((res) => {
            const {
              title, description, posts,
            } = parser(res.data.contents);

            const existingFeed = watchedState.data.feeds
              .find((feed) => (feed.title === title) && (feed.description === description));

            const existingPosts = watchedState.data.posts
              .filter(({ feedId }) => feedId === existingFeed.id);

            const newPosts = _.unionBy(existingPosts, posts, 'link')
              .filter((post) => !post.feedId)
              .map((post) => ({
                id: _.uniqueId(),
                title: post.title,
                link: post.link,
                feedId: existingFeed.id,
              }));

            if (newPosts.length !== 0) {
              watchedState.data.posts.push(...newPosts);
            }
          })
          .catch(() => {
            watchedState.processState = 'error';
            watchedState.error = 'erorrs.netWorkErorr';
          });
      });
    }
    updatePosts(watchedState, delay);
  }, delay);
};

const renderList = (posts) => posts.map((post) => {
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
  button.textContent = 'Просмотр';

  li.append(a);
  li.append(button);

  return li;
});

const renderModal = (elements, activePost) => {
  const titleModal = elements.modal.querySelector('.modal-title');
  const descriptionModal = elements.modal.querySelector('.modal-body');
  const fullArticleLink = elements.modal.querySelector('a');

  titleModal.innerHTML = activePost.title;
  descriptionModal.innerHTML = activePost.description;
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

const renderPosts = (posts, prevPosts, container) => {
  if (container.hasChildNodes()) {
    const difference = posts.length - prevPosts.length;
    const newPosts = posts.slice(-difference);
    const listGroup = container.querySelector('ul');
    renderList(newPosts).forEach((li) => listGroup.append(li));

    return;
  }

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Посты';

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  renderList(posts).forEach((li) => listGroup.append(li));

  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(listGroup);

  container.append(card);
};

const renderFeeds = (feeds, container) => {
  if (container.hasChildNodes()) {
    const listGroup = container.querySelector('ul');
    listGroup.innerHTML = feeds.map((feed) => `<li class="list-group-item border-0 border-end-0"><h3 class="h6 m-0">${feed.title}</h3><p class="m-0 small text-black-50">${feed.description}</p></li>`).join('');
    return;
  }

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Фиды';

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  listGroup.innerHTML = feeds.map((feed) => `<li class="list-group-item border-0 border-end-0"><h3 class="h6 m-0">${feed.title}</h3><p class="m-0 small text-black-50">${feed.description}</p></li>`).join('');

  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(listGroup);

  container.append(card);
};

const renderErrors = (elements, value, i18nInstance) => {
  elements.outputError.innerHTML = i18nInstance.t(value);
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

export const render = (elements, i18nInstance) => (path, value, prevValue) => {
  const target = path.split('.')[1];
  const container = elements[target];

  switch (path) {
    case 'processState':
      handleProcessState(elements, value);
      break;

    case 'data.posts':
      renderPosts(value, prevValue, container);
      break;

    case 'data.feeds':
      renderFeeds(value, container);
      break;

    case 'error':
      renderErrors(elements, value, i18nInstance);
      break;

    case 'shownPosts':
      renderShownPosts(elements, value);
      break;

    case 'modal.post':
      renderModal(elements, value);
      break;

    default:
      break;
  }
};
