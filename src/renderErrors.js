export default (elements, value, i18nInstance) => {
  // eslint-disable-next-line no-param-reassign
  elements.outputError.innerHTML = i18nInstance.t(value);
};
