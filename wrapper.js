class ComickIoAPI {
  constructor() {
    this.baseUrl = 'https://comick.io';
    this.subPicturesUrl = 'https://meo.comick.pictures/';
    this.buildId = '.5e0373503a1a8a82c913dba8a0de490f2157dd0d';
    this.comicData = null;
    this.chapterData = null;
  }

  async fetchApiContent(url) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await res.text();
      const clean = text.replace(/^`+|`+$/g, '');
      const json = JSON.parse(clean);
      if (json.notFound) return { status: false, message: 'notFound' };
      return { status: true, data: json };
    } catch (e) {
      return { status: false, message: e.message };
    }
  }

  async fetchPageContent(url) {
    try {
      const res = await fetch(url);
      return await res.text();
    } catch (_) {
      return false;
    }
  }

  async getBuildId() {
    const html = await this.fetchPageContent(this.baseUrl);
    if (!html) return { status: false, message: 'Build ID not found' };
    const match = html.match(/"buildId":"([^"]+)"/);
    return match
      ? { status: true, buildId: match[1] }
      : { status: false, message: 'Build ID not found' };
  }

  async getComicData(comicUrl) {
    const parts = comicUrl.split('/');
    if (parts[3] !== 'comic') {
      return {
        status: false,
        message: 'Incorrect URL format. Use: https://comick.io/comic/{slug}'
      };
    }
    const slug = parts[4];
    const url = `${this.baseUrl}/_next/data/${this.buildId}/comic/${slug}.json?slug=${slug}`;
    const res = await this.fetchApiContent(url);
    if (res.status) this.comicData = res.data;
    return res;
  }

  async getComicId(comicUrl = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    return { status: true, comicid: data.data.pageProps.comic.id };
  }

  async getComicSlug(comicUrl = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    return { status: true, slug: data.data.pageProps.comic.slug };
  }

  async getComicTitle(comicUrl = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    return { status: true, title: data.data.pageProps.comic.title };
  }

  async getComicCoverLink(comicUrl = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    const b2key = data.data.pageProps.comic.md_covers?.[0]?.b2key;
    return b2key
      ? { status: true, cover: this.subPicturesUrl + b2key }
      : { status: false, message: 'Cover not found' };
  }

  async getComicLastChapter(comicUrl = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    return {
      status: true,
      last_chapter: parseInt(data.data.pageProps.comic.last_chapter)
    };
  }

  async getComicCountry(comicUrl = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    return {
      status: true,
      country: data.data.pageProps.comic.country
    };
  }

  async getComicChapters(comicUrl = null, lang = null) {
    const data = comicUrl ? await this.getComicData(comicUrl) : { data: this.comicData };
    if (!data?.data) return { status: false, message: 'Comic data missing' };
    let chapters = data.data.pageProps.firstChapters;
    if (lang) chapters = chapters.filter(ch => ch.lang === lang);
    if (chapters.length === 0) {
      return { status: false, message: 'No chapters in this language yet' };
    }
    return {
      status: true,
      chapters: chapters.map(ch => ({
        id: ch.id,
        hid: ch.hid,
        title: ch.title,
        lang: ch.lang,
        vol: ch.vol,
        chap: ch.chap ?? 1
      }))
    };
  }

  async getComicChapterImages(comicUrl, hid, lang, chap) {
    const slugRes = await this.getComicSlug(comicUrl);
    if (!slugRes.status) return { status: false, message: 'Slug not found' };
    const slug = slugRes.slug;
    const url = `${this.baseUrl}/_next/data/${this.buildId}/comic/${slug}/${hid}-chapter-${chap}-${lang}.json?slug=${slug}&chapter=${hid}-chapter-${chap}-${lang}`;
    const res = await this.fetchApiContent(url);
    if (!res.status) return { status: false, message: 'Could not fetch chapter data' };
    return {
      status: true,
      images: res.data.pageProps.chapter.md_images.map(img => this.subPicturesUrl + img.b2key)
    };
  }
}

export default ComickIoAPI;
