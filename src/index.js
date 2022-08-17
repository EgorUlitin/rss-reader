/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
import 'bootstrap/dist/css/bootstrap.min.css';
// eslint-disable-next-line no-unused-vars
import bootstrap from 'bootstrap';
import onChange from 'on-change';
import axios from 'axios';
import i18n from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';
import resources from './locales/index.js';
import parser from './parser.js';
import render from './view.js';

const updatePosts = (watchedState, delay) => {
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

const app = () => {
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

                const normalized = parser(res.data.contents);

                const feedId = _.uniqueId();

                const postsWithIds = normalized.posts.map(({ title, link, description }) => ({
                  feedId, title, link, id: _.uniqueId(), description,
                }));

                watchedState.data.feeds = [...watchedState.data.feeds, { id: feedId, title: normalized.title, description: normalized.description }];

                watchedState.data.posts = [...watchedState.data.posts, ...postsWithIds];

                updatePosts(watchedState, 5000);
              }
            })
            .catch((err) => {
              if (err === 'Ошибка парсинга') {
                watchedState.processState = 'error';
                watchedState.error = 'erorrs.notContainValidRss';
                return;
              }
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

app();
