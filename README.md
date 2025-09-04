# comickAPIwrapper.js

A simple JavaScript wrapper for the [Comick.io](https://comick.io) API — built for use in **web-based comic readers**.

Lightweight, no dependencies, browser-compatible.

---

## Features

- Fetch comic metadata
- Get cover, title, slug, country, last chapter
- List available chapters (with language filter)
- Get image URLs for any chapter

---

## Installation

Just copy the `ComickIoAPI.js` file into your project, or import it as a module.

```js
import ComickIoAPI from './ComickIoAPI.js';
```


---

## Usage

```js
const comick = new ComickIoAPI();

const comicUrl = 'https://comick.io/comic/na-honjaman-level-up-ragnarok';

const info = await comick.getComicData(comicUrl);
console.log(info.data.pageProps.comic.title);

const cover = await comick.getComicCoverLink(comicUrl);
console.log(cover.cover);

const chapters = await comick.getComicChapters(comicUrl, 'en');
console.log(chapters.chapters);

const first = chapters.chapters[0];
const images = await comick.getComicChapterImages(comicUrl, first.hid, first.lang, first.chap);
console.log(images.images); // array of image URLs
```

---

##  Notes

- This is **unofficial** and **not affiliated** with Comick.io.
- Build ID (`this.buildId`) may break if Comick.io updates. Use `getBuildId()` to dynamically fetch if needed.
- Image URLs are direct and hotlink from `meo.comick.pictures`.

---
