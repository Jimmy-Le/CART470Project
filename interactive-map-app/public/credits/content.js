'use strict';
const Credits = (() => {
  const key = 'cart470.credits.v1:' + new URL('.', location.href).pathname;
  const pageKeys = 'pageTitle skip pause resume reduced eyebrow title intro follow endingLabel endingTitle endingEm thanks back footerLeft footerRight'.split(' ');
  function field(value) {
    return value && typeof value.text === 'string' &&
      (value.size == null || Number.isFinite(value.size) && value.size > 0) &&
      ['bold','italic'].every(k => value[k] == null || typeof value[k] === 'boolean');
  }
  function validate(data) {
    if (data?.version !== 1 || !pageKeys.every(k => field(data.page?.[k])) ||
        !Array.isArray(data.gullLines) || !data.gullLines.length || !data.gullLines.every(field) ||
        !Array.isArray(data.sections) || !data.sections.length || !data.sections.every(s =>
          ['title','label','note'].every(k => field(s?.[k])) && Array.isArray(s.people) &&
          s.people.every(p => field(p?.role) && field(p?.name)))) {
      throw new Error('Choose a credits.json exported by this editor.');
    }
    return data;
  }
  async function load(draft) {
    if (draft) {
      const saved = localStorage.getItem(key);
      if (saved) return validate(JSON.parse(saved));
    }
    const response = await fetch('credits.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('credits.json is unavailable.');
    return validate(await response.json());
  }
  function paint(el, field) {
    el.textContent = field.text;
    el.style.whiteSpace = 'pre-line';
    el.style.fontSize = field.size ? field.size + 'px' : '';
    el.style.fontStyle = field.italic == null ? '' : field.italic ? 'italic' : 'normal';
    el.style.fontWeight = field.bold == null ? '' : field.bold ? '700' : '400';
  }
  return {key, validate, load, paint};
})();
