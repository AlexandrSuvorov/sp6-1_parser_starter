// @todo: напишите здесь код парсера

function parsePage() {
  return {
    meta: getMetaData(),
    product: getProductData(),
    suggested: getSuggestedData(),
    reviews: getReviewsData(),
  };
}

function getMetaData() {
  //Язык страницы
  const lang = document.documentElement.lang;
  //Заголовок страницы
  const title = document.title.split("—")[0].trim();
  //Описание из мета-тега
  const description = document.querySelector(
    'meta[name="description"]',
  )?.content;
  //Ключевые слова
  const keywords = document
    .querySelector('meta[name="keywords"]')
    .content.split(",")
    .map((keyword) => keyword.trim());
  //Оpengraph-описание
  const opengraph = {};
  const propertyList = document.querySelectorAll('[property*="og:"]');
  propertyList.forEach((property) => {
    const propertyKey = property.getAttribute("property").split("og:")[1];
    if (propertyKey === "title") {
      opengraph[propertyKey] = property
        .getAttribute("content")
        .split("—")[0]
        .trim();
    } else {
      opengraph[propertyKey] = property.getAttribute("content").trim();
    }
  });
  return {
    language: lang,
    title: title,
    description: description,
    keywords: keywords,
    opengraph: opengraph,
  };
}

function getProductData() {
  //Идентификатор товара
  const id = document.querySelector(".product").dataset.id;
  //Массив фотографий
  const imagesList = document.querySelectorAll("button img");
  const imagesParse = [];
  imagesList.forEach((image) => {
    const preview = image.src;
    const full = image.dataset.src;
    const alt = image.alt;
    const obj = {
      preview: preview,
      full: full,
      alt: alt,
    };
    imagesParse.push(obj);
  });
  //Статус лайка
  let isLiked;
  const like = document.querySelector(".like");
  if (like.classList.contains("active")) {
    isLiked = true;
  } else {
    isLiked = false;
  }
  //Название товара
  const nameProduct = document.querySelector("h1").textContent;
  //Массивы бирок, категорий и скидок
  const tagsList = document.querySelectorAll(".tags span");
  const tagsParse = {
    category: [],
    label: [],
    discount: [],
  };
  tagsList.forEach((tag) => {
    if (tag.classList.contains("green")) {
      tagsParse.category.push(tag.textContent.trim());
    } else if (tag.classList.contains("blue")) {
      tagsParse.label.push(tag.textContent.trim());
    } else if (tag.classList.contains("red")) {
      tagsParse.discount.push(tag.textContent.trim());
    }
  });
  //Цена товара
  const price = document.querySelector(".price");
  const currentPrice = Number(price.childNodes[0].textContent.match(/\d+/)[0]);
  const oldPrice = Number(
    price.querySelector("span").textContent.match(/\d+/)[0],
  );
  //Размер скидки
  let discount = 0;
  let discountPercent = 0;
  if (oldPrice > currentPrice) {
    discount = oldPrice - currentPrice;
    discountPercent = (discount / oldPrice) * 100;
  }
  //Валюта
  let currencyName;
  const currentPriceСurrency = price.childNodes[0].textContent
    .trim()
    .match(/[$€₽]/)?.[0];

  switch (currentPriceСurrency) {
    case "$":
      currencyName = "USD";
      break;
    case "€":
      currencyName = "EUR";
      break;
    case "₽":
      currencyName = "RUB";
      break;
    default:
      console.log(`Unknown currency: ${currentPriceСurrency}.`);
  }
  //Свойства товара
  const properties = {};
  const propertiesList = document.querySelectorAll(".properties li");
  propertiesList.forEach((propertie) => {
    properties[propertie.firstElementChild.textContent] =
      propertie.lastElementChild.textContent;
  });
  //Полное описание
  const description = document.querySelector(".description").cloneNode(true);
  description.querySelectorAll("[class]").forEach((el) => {
    el.classList.remove("unused");
    if (el.classList.length === 0) {
      el.removeAttribute("class");
    }
  });
  const descriptionProduct = description.innerHTML.trim();

  return {
    id: id,
    name: nameProduct,
    isLiked: isLiked,
    tags: tagsParse,
    price: currentPrice,
    oldPrice: oldPrice,
    discount: discount,
    discountPercent: `${discountPercent.toFixed(2)}%`,
    currency: currencyName,
    properties: properties,
    description: descriptionProduct,
    images: imagesParse,
  };
}

function getSuggestedData() {
  const suggested = [];
  const suggestedList = document.querySelectorAll(".suggested .items article");
  let currentPriceСurrency;
  suggestedList.forEach((item) => {
    const product = {};
    currentPriceСurrency = item.children[2].textContent
      .trim()
      .match(/[$€₽]/)?.[0];
    switch (currentPriceСurrency) {
      case "$":
        currentPriceСurrency = "USD";
        break;
      case "€":
        currentPriceСurrency = "EUR";
        break;
      case "₽":
        currentPriceСurrency = "RUB";
        break;
      default:
        console.log(`Unknown currency: ${currentPriceСurrency}.`);
    }
    product.name = item.children[1].textContent;
    product.description = item.children[3].textContent;
    product.image = item.children[0].src;
    product.price = item.children[2].textContent.match(/\d+/)[0];
    product.currency = currentPriceСurrency;
    suggested.push(product);
  });
  return suggested;
}

function getReviewsData() {
  const reviews = [];
  const reviewsList = document.querySelectorAll(".reviews .items article");
  reviewsList.forEach((item) => {
    const review = {};

    let rating = 0;
    const ratingEl = item.children[0].querySelectorAll("span");
    ratingEl.forEach((item) => {
      if (item.classList.contains("filled")) {
        rating++;
      }
    });

    //Автор
    const author = {};
    const authorList = item.children[2];
    //Аватар
    author.avatar = authorList.querySelector("img").src;
    //Имя автора
    author.name = authorList.querySelector("span").textContent;
    //Заголовок
    const title = item.children[1].querySelector("h3").textContent;
    const date = authorList.querySelector("i").textContent.replaceAll("/", ".");
    const desc = item.children[1].querySelector("p").textContent;

    review.rating = rating;
    review.author = author;
    review.title = title;
    review.description = desc;
    review.date = date;
    reviews.push(review);
  });
  return reviews;
}

window.parsePage = parsePage;
