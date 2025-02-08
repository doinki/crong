import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { filter, from, map, merge, mergeMap } from 'rxjs';

const client = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function schedule() {
  merge(toss$(), daangn$(), woowahan$(), kerly$(), naver$(), line$())
    .pipe(
      mergeMap(async (post) => {
        const response = await openai.chat.completions.create({
          messages: [
            {
              content: [
                {
                  text: 'You are a helpful assistant that receives HTML text as input and returns a JSON object with the following structure:\n\n{\n  "summary": "string",\n  "tags": ["string"]\n}\n\n# Summary\n- The summary must be written in Korean (formal tone) (e.g., “...입니다.”, “...입습니다.”, “...합니다.”), 3 to 5 lines.\n- Assume the reader is a developer. Keep it concise and clear.\n- Focus on the core message without using explanatory phrases (e.g., “이 글은 …를 설명합니다.”).\nDo not use first-person pronouns (e.g., “나는”, “우리는”, “저희는”).\n\n# Tags\n- Identify up to 3 key IT technologies mentioned in the text.\n- Each tag must be in English, singular form, and lowercase.\n- Use one word for each tag whenever possible.\n- If there are multiple variations of the same technology, unify them under the word that is most relevant to the text.\n\nReturn only valid JSON. No extra text or explanations.',
                  type: 'text',
                },
              ],
              role: 'system',
            },
            {
              content: [
                {
                  text: ['# ' + post.title, post.content].join('\n'),
                  type: 'text',
                },
              ],
              role: 'user',
            },
          ],
          model: 'gpt-4o-mini',
          response_format: {
            type: 'json_object',
          },
        });

        const data = JSON.parse(response.choices[0].message.content);

        return {
          ...post,
          summary: data.summary,
          tags: data.tags,
        };
      }),
      mergeMap(async (post) => {
        await client.post.create({
          data: {
            publishedAt: post.publishedAt,
            source: post.source,
            summary: post.summary,
            tags: post.tags,
            title: post.title,
            url: post.url,
          },
        });

        return post;
      }),
    )
    .subscribe({
      error: (error) => {
        console.error(error);
      },
      next: (post) => {
        console.log(post);
      },
    });
}

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

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function getContent(html, selector) {
  const $ = cheerio.load(html);
  $('style, button, script, pre').remove();

  if (selector) {
    return $(selector).text().trim().replaceAll(/\s+/g, ' ');
  }

  return $.text().trim().replaceAll(/\s+/g, ' ');
}
