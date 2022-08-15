import renderList from './renderList.js';

export default (posts, prevPosts, container) => {
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
