import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debaunc from 'lodash.debounce';
import { fetchSubmit } from './fetchsubmit';

const refs = {
  form: document.querySelector('form[id="search-form"]'),
  button: document.querySelector('button[type="submit"]'),
  gallery: document.querySelector('.gallery'),
};

const DEBAUNC_DILEY = 300;
let PAGE_NUMBER = 0;
let USER_INPUT = '';

window.addEventListener('scroll', debaunc(infinitScrol, 500));
refs.form.addEventListener('input', debaunc(onInputType, DEBAUNC_DILEY));
refs.form.addEventListener('submit', onTypeSubmit);
refs.gallery.addEventListener('click', onClickGalleryImg);

// Запит користувача......
function onInputType(e) {
  USER_INPUT = e.target.value;
  PAGE_NUMBER = 0;

  if (USER_INPUT === '') {
    setDiseabled();
    return;
  }
  removewDisabled();
}

// Запит на бекенд по натисканню кнопки.......
function onTypeSubmit(event) {
  event.preventDefault();
  PAGE_NUMBER += 1;

  setDiseabled();
  clearGallary();

  fetchSubmit(USER_INPUT, PAGE_NUMBER)
    .then(ifInputNotValid)
    .then(totalHits)
    .then(renderMarkup)
    .catch(ifRequestLimit);
}

// Якщо запит клієнта був не валідний Бекенд поверта пустий масив.......
function ifInputNotValid(date) {
  if (date.hits.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  return date;
}

// Повідомлення про загальну кількість зображень ,,,,,
function totalHits(date) {
  if (PAGE_NUMBER === 1) {
    Notify.info(`Hooray! We found ${date.totalHits} images.`);
  }

  return date;
}

// Якщо користувач досяг ліміту доступних йому запитів.....
function ifRequestLimit({ totalHits }) {
  if (totalHits === totalHits) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

// рендер розмітки .......
function renderMarkup({ hits }) {
  const markupGalery = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <div class="photo-card">
       <a class="gallery__item" href="${largeImageURL}">
       <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" width="200" height="150"/>
       </a>
       <div class="info">
         <p class="info-item">
           <b>Likes: ${likes}</b>
         </p>
         <p class="info-item">
           <b>Views: ${views}</b>
         </p>
         <p class="info-item">
           <b>Comments: ${comments}</b>
         </p>
         <p class="info-item">
           <b>Downloads: ${downloads}</b>
         </p>
       </div>
       </div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('afterbegin', markupGalery);
}

// Модалка,,,,,,,,,
function onClickGalleryImg(e) {
  e.preventDefault();

  if (e.target.nodeName !== 'IMG') {
    return;
  }

  laigtBox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
    close: true,
  });
}

//  додавання та видалення атрибуту disabled
function setDiseabled() {
  refs.button.setAttribute('disabled', 'disabled');
}
function removewDisabled() {
  refs.button.removeAttribute('disabled');
}

// Очистка галереї мутодом  innerHTML
function clearGallary() {
  refs.gallery.innerHTML = '';
}

// Бесконечная загрузка .........

function infinitScrol() {
  const lastElement = refs.gallery.lastElementChild;
  const target = lastElement;
  const options = {
    root: document.querySelector(null),
    rootMargin: '700px',
    threshold: 0.25,
  };

  const callback = function (entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        PAGE_NUMBER += 1;
        fetchSubmit(USER_INPUT, PAGE_NUMBER)
          .then(infinitRenderMarkup)
          .catch(ifRequestLimit);
        return;
      }
    });
  };

  const observer = new IntersectionObserver(callback, options);

  observer.observe(target);
}

function infinitRenderMarkup({ hits }) {
  const markupGalery = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <div class="photo-card">
       <a class="gallery__item" href="${largeImageURL}">
       <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" width="200" height="150"/>
       </a>
       <div class="info">
         <p class="info-item">
           <b>Likes: ${likes}</b>
         </p>
         <p class="info-item">
           <b>Views: ${views}</b>
         </p>
         <p class="info-item">
           <b>Comments: ${comments}</b>
         </p>
         <p class="info-item">
           <b>Downloads: ${downloads}</b>
         </p>
       </div>
       </div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markupGalery);
}
