/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import axios from 'axios';
import i18n from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';
import resources from './locales/index.js';
import parser from './parser.js';
import normalize from './normalize.js';
import updatePosts from './updatePosts.js';
import renderErrors from './renderErrors.js';
import renderFeeds from './renderFeeds.js';
import renderPosts from './renderPosts.js';
import renderShownPosts from './renderShownPosts.js';
import renderModal from './renderModal.js';

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

    case 'modal.post':
      renderModal(elements, value);
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
    error: '',
    modal: { post: null },
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

                if (parsed.querySelector('parsererror')) {
                  watchedState.processState = 'error';
                  watchedState.error = 'erorrs.notContainValidRss';
                  return;
                }

                const normalized = normalize(parsed);

                const feedId = _.uniqueId();

                const postsWithIds = normalized.posts.map(({ title, link, description }) => ({
                  feedId, title, link, id: _.uniqueId(), description,
                }));

                watchedState.data.feeds = [...watchedState.data.feeds, { id: feedId, title: normalized.title, description: normalized.description }];

                watchedState.data.posts = [...watchedState.data.posts, ...postsWithIds];

                updatePosts(watchedState, 5000);
              }
            })
            .catch(() => {
              watchedState.processState = 'error';
              watchedState.error = 'erorrs.netWorkErorr';
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
        watchedState.modal.post = activePost;
      }
    }
  });
};
