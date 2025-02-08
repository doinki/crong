import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { filter, from, map, merge, mergeMap } from 'rxjs';

const client = new PrismaClient();

merge(toss$(), daangn$(), woowahan$(), kerly$(), naver$(), line$()).subscribe(
  console.log,
);

function toss$() {
  return from(fetchHtml('https://toss.tech/rss.xml')).pipe(
    mergeMap((xml) => cheerio.load(xml, { xml: true })('item').toArray()),
    map((el) => {
      const $ = cheerio.load(el, { xml: true });
      const title = $('title').text().trim();
      const content = $(String.raw`content\:encoded`)
        .text()
        .trim();
      const url = $('link').text().trim();
      const publishedAt = $('pubDate').text().trim();

      if (!url || !content) {
        return null;
      }

      return {
        content: getContent(content),
        publishedAt: new Date(publishedAt),
        source: '토스',
        title,
        url,
      };
    }),
    filter(Boolean),
    mergeMap(async (post) =>
      (await client.post.findFirst({
        where: { url: post.url },
      }))
        ? null
        : post,
    ),
    filter(Boolean),
  );
}

function daangn$() {
  return from(fetchHtml('https://medium.com/feed/daangn')).pipe(
    mergeMap((xml) => cheerio.load(xml, { xml: true })('item').toArray()),
    map((el) => {
      const $ = cheerio.load(el, { xml: true });
      const title = $('title').text().trim();
      const content = $(String.raw`content\:encoded`)
        .text()
        .trim();
      const url = $('link').text().trim();
      const publishedAt = $('pubDate').text().trim();

      if (!url || !content) {
        return null;
      }

      return {
        content: getContent(content),
        publishedAt: new Date(publishedAt),
        source: '당근',
        title,
        url,
      };
    }),
    filter(Boolean),
    mergeMap(async (post) =>
      (await client.post.findFirst({
        where: { url: post.url },
      }))
        ? null
        : post,
    ),
    filter(Boolean),
  );
}

function woowahan$() {
  return from(fetchHtml('https://techblog.woowahan.com/feed/')).pipe(
    mergeMap((xml) => cheerio.load(xml, { xml: true })('item').toArray()),
    map((el) => {
      const $ = cheerio.load(el, { xml: true });
      const title = $('title').text().trim();
      const content = $(String.raw`content\:encoded`)
        .text()
        .trim();
      const url = $('link').text().trim();
      const publishedAt = $('pubDate').text().trim();

      if (!url || !content) {
        return null;
      }

      return {
        content: getContent(content),
        publishedAt: new Date(publishedAt),
        source: '우아한형제들',
        title,
        url,
      };
    }),
    filter(Boolean),
    mergeMap(async (post) =>
      (await client.post.findFirst({
        where: { url: post.url },
      }))
        ? null
        : post,
    ),
    filter(Boolean),
  );
}

function kerly$() {
  return from(fetchHtml('https://helloworld.kurly.com/feed.xml')).pipe(
    mergeMap((xml) => cheerio.load(xml, { xml: true })('item').toArray()),
    map((el) => {
      const $ = cheerio.load(el, { xml: true });
      const title = $('title').text().trim();
      const url = $('link').text().trim();
      const publishedAt = $('pubDate').text().trim();

      if (!url) {
        return null;
      }

      return {
        publishedAt: new Date(publishedAt),
        source: '컬리',
        title,
        url,
      };
    }),
    filter(Boolean),
    mergeMap(async (post) =>
      (await client.post.findFirst({
        where: { url: post.url },
      }))
        ? null
        : post,
    ),
    filter(Boolean),
    mergeMap(async (post) => {
      const html = await fetchHtml(post.url);

      return {
        ...post,
        content: getContent(html, 'div.post'),
      };
    }),
  );
}

function naver$() {
  return from(fetchHtml('https://d2.naver.com/d2.atom')).pipe(
    mergeMap((xml) => cheerio.load(xml, { xml: true })('entry').toArray()),
    map((el) => {
      const $ = cheerio.load(el, { xml: true });
      const title = $('title').text().trim();
      const url = $('link[rel="alternate"]').attr('href')?.trim();
      const publishedAt = $('updated').text().trim();

      if (!url) {
        return null;
      }

      const id = /\d+$/.exec(url)?.at(0);

      if (!id) {
        return null;
      }

      return {
        id,
        publishedAt: new Date(publishedAt),
        source: '네이버',
        title,
        url,
      };
    }),
    filter(Boolean),
    mergeMap(async (post) =>
      (await client.post.findFirst({
        where: { url: post.url },
      }))
        ? null
        : post,
    ),
    filter(Boolean),
    mergeMap(async (post) => {
      const content = await fetchJson(
        `https://d2.naver.com/api/v1/contents/${post.id}`,
      ).then((data) => data.postHtml);

      return {
        ...post,
        content: getContent(content),
      };
    }),
  );
}

function line$() {
  return from(
    fetchHtml('https://techblog.lycorp.co.jp/ko/feed/index.xml'),
  ).pipe(
    mergeMap((xml) => cheerio.load(xml, { xml: true })('item').toArray()),
    map((el) => {
      const $ = cheerio.load(el, { xml: true });
      const title = $('title').text().trim();
      const url = $('link').text().trim();
      const id = url.split('/').pop();
      const publishedAt = $('pubDate').text().trim();

      if (!url || !id) {
        return null;
      }

      return {
        id,
        publishedAt: new Date(publishedAt),
        source: '라인',
        title,
        url,
      };
    }),
    filter(Boolean),
    mergeMap(async (post) =>
      (await client.post.findFirst({
        where: { url: post.url },
      }))
        ? null
        : post,
    ),
    filter(Boolean),
    mergeMap(async (post) => {
      const content = await fetchJson(
        `https://techblog.lycorp.co.jp/page-data/ko/${post.id}/page-data.json`,
      ).then((data) => data.result.data.blogDetail.content);

      return {
        ...post,
        content: getContent(content),
      };
    }),
  );
}

async function fetchHtml(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function getContent(html: string, selector?: string): string {
  const $ = cheerio.load(html);
  $('style, button, script, pre').remove();

  if (selector) {
    return $(selector).text().trim().replaceAll(/\s+/g, ' ');
  }

  return $.text().trim().replaceAll(/\s+/g, ' ');
}
