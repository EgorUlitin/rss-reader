import onChange from 'on-change';
import axios from 'axios';
import i18n from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';
import resources from './locales/index.js';
import parser from './parser.js';
import normalize from './normalize.js';
import updatePosts from './updatePosts.js';

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'success':
      // eslint-disable-next-line no-param-reassign
      elements.submitButton.disabled = false;
      elements.outputError.classList.remove('text-danger');
      elements.outputError.classList.add('text-success');
      // eslint-disable-next-line no-param-reassign
      elements.input.value = '';
      break;

    case 'error':
      elements.input.classList.add('is-invalid');
      elements.outputError.classList.remove('text-success');
      elements.outputError.classList.add('text-danger');
      // eslint-disable-next-line no-param-reassign
      elements.submitButton.disabled = false;
      break;

    case 'sending':
      elements.input.classList.remove('is-invalid');
      // eslint-disable-next-line no-param-reassign
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.input.classList.remove('is-invalid');
      break;

    case 'modal':
      elements.modal.classList.toggle('show');
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderErrors = (elements, value, i18nInstance) => {
  // eslint-disable-next-line no-param-reassign
  elements.outputError.innerHTML = i18nInstance.t(value);
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

const renderShownPosts = (elements, postIds) => {
  const container = elements.posts;

  [...container.querySelectorAll('a')]
    .filter((a) => postIds.includes(a.dataset.id))
    .forEach((a) => {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal');
    });
};

const render = (elements, i18nInstance) => (path, value, prevValue) => {
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

    default:
      break;
  }
};

export default () => {
  const elements = {
    outputError: document.querySelector('#error-input'),
    input: document.querySelector('#url-input'),
    form: document.querySelector('form'),
    submitButton: document.querySelector('button[type="submit"]'),
    posts: document.querySelector('#posts'),
    feeds: document.querySelector('#feeds'),
    modal: document.querySelector('#modal'),
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    });

  yup.setLocale({
    string: {
      url: i18nInstance.t('yupErorrs.url'),
    },
  });

  const schema = yup.string().url().nullable();

  const state = {
    currentUrl: '',
    processState: 'filling',
    modal: { postId: null },
    error: '',
    shownPosts: [],
    addedFeeds: [],
    data: {
      posts: [],
      feeds: [],
    },
  };

  const watchedState = onChange(state, render(elements, i18nInstance));

  elements.input.addEventListener('input', (e) => {
    e.preventDefault();

    const { value } = e.target;
    watchedState.currentUrl = value;
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (watchedState.addedFeeds.includes(watchedState.currentUrl)) {
      watchedState.processState = 'error';
      watchedState.error = 'erorrs.rssExist';
    } else {
      schema.validate(watchedState.currentUrl)
        .then(() => {
          watchedState.error = '';
          watchedState.processState = 'sending';

          axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.currentUrl)}`)
            .then((res) => {
              if (res.status === 200) {
                watchedState.processState = 'success';
                watchedState.error = 'successfully';
                watchedState.addedFeeds.push(watchedState.currentUrl);

                const parsed = parser(res.data.contents);

                const normalized = normalize(parsed);

                const feedId = _.uniqueId();

                const postsWithIds = normalized.posts.map(({ title, link, description }) => ({
                  feedId, title, link, id: _.uniqueId(), description,
                }));

                // eslint-disable-next-line max-len
                watchedState.data.feeds = [...watchedState.data.feeds, { id: feedId, title: normalized.title, description: normalized.description }];

                watchedState.data.posts = [...watchedState.data.posts, ...postsWithIds];

                updatePosts(watchedState, 5000);
              }
            })
            .catch(() => {
              watchedState.processState = 'error';
              watchedState.error = 'erorrs.notContainValidRss';
            });
        })
        .catch(() => {
          watchedState.processState = 'error';
          watchedState.error = 'erorrs.notValid';
        });
    }
  });

  elements.posts.addEventListener('click', (e) => {
    const { id } = e.target.dataset;

    if (id) {
      watchedState.shownPosts.push(id);

      if (e.target.getAttribute('type') === 'button') {
        const activePost = watchedState.data.posts.find((post) => post.id === id);

        const titleModal = elements.modal.querySelector('.modal-title');
        const descriptionModal = elements.modal.querySelector('.modal-body');
        const fullArticleLink = elements.modal.querySelector('a');

        titleModal.innerHTML = activePost.title;
        descriptionModal.innerHTML = activePost.description;
        fullArticleLink.setAttribute('href', activePost.link);
      }
    }
  });
};
