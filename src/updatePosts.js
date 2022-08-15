import axios from 'axios';
import _ from 'lodash';
import parser from './parser.js';
import normalize from './normalize.js';

const updatePosts = (watchedState, delay) => {
  setTimeout(() => {
    if (watchedState.addedFeeds.length !== 0) {
      watchedState.addedFeeds.forEach((link) => {
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
          .then((res) => {
            if (res.status === 200) {
              const parsed = parser(res.data.contents);

              const {
                title, description, posts,
              } = normalize(parsed);

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
            }
          })
          .catch((err) => {
            console.log(err, 'updater');
            // watchedState.processState = 'error';
            // watchedState.error = err.message;
            // watchedState.error = 'erorrs.notValid';
          });
      });
    }
    updatePosts(watchedState, delay);
  }, delay);
};

export default updatePosts;
