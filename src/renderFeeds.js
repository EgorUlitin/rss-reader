export default (feeds, container) => {
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
