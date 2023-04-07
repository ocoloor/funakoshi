import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";
import { wikipedia } from "./wikipedia.ts";

const FIXTURE_SEARCH_RESPONSE = {
  batchcomplete: "",
  continue: { sroffset: 5, continue: "-||" },
  query: {
    searchinfo: { totalhits: 58753 },
    search: [
      {
        ns: 0,
        title: "宇宙",
        pageid: 3957,
        size: 50693,
        wordcount: 7066,
        snippet:
          '<span class="searchmatch">宇宙</span>（うちゅう）について、本項では漢語（およびその借用語）としての「<span class="searchmatch">宇宙</spa...',
        timestamp: "2023-03-30T14:28:00Z",
      },
      {
        ns: 0,
        title: "アメリカ航空宇宙局",
        pageid: 1065,
        size: 45961,
        wordcount: 6203,
        snippet:
          'NASAはアメリカの<span class="searchmatch">宇宙</span>開発における国家的努力をそれ以前よりもさらに充実させ、アポロ計画における人類初の月面着陸、スカイラブ計画におけ...',
        timestamp: "2023-02-25T08:08:34Z",
      },
      {
        ns: 0,
        title: "宇宙開発",
        pageid: 1887472,
        size: 9101,
        wordcount: 986,
        snippet:
          'ソビエト連邦の宇宙開発 日本の<span class="searchmatch">宇宙</span>開発 中国の<span class="searchmatch">宇宙</span>開発 ポータル <...',
        timestamp: "2023-04-02T22:16:37Z",
      },
      {
        ns: 0,
        title: "欧州宇宙機関",
        pageid: 7270,
        size: 16868,
        wordcount: 1877,
        snippet:
          '欧州<span class="searchmatch">宇宙</span>機関（おうしゅううちゅうきかん、仏: Agence spatiale européenne, ASE、英: European ...',
        timestamp: "2023-03-24T11:36:55Z",
      },
      {
        ns: 0,
        title: "宇宙船",
        pageid: 42082,
        size: 8986,
        wordcount: 1098,
        snippet:
          '<span class="searchmatch">宇宙</span>船（うちゅうせん、spaceship）は、<span class="searchmatch">宇宙</span>機のなかで、とくに...',
        timestamp: "2023-01-07T02:51:31Z",
      },
    ],
  },
};

mf.install();

const { createContext, dispatch } = createMentionCommandTester(wikipedia);
Deno.test("wikipedia (wiki)", async () => {
  const apiCalls: Request[] = [];
  mf.mock("GET@/w/api.php", (req) => {
    apiCalls.push(req);
    return new Response(JSON.stringify(FIXTURE_SEARCH_RESPONSE));
  });

  const res = await dispatch(
    createContext("<@BOT> wiki 宇宙"),
  );

  assert(res.type === "message");
  assertMatch(res.text, /^https:\/\/ja\.wikipedia\.org\/\?curid=\d+$/);

  assertEquals(apiCalls.length, 1);
  assertEquals(
    apiCalls[0].url,
    // encoded "宇宙" & action=query&format=json&list=search
    "https://ja.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=5&srsearch=%E5%AE%87%E5%AE%99",
  );
});

Deno.test("wikipedia (wikipedia)", async () => {
  const apiCalls: Request[] = [];
  mf.mock("GET@/w/api.php", (req) => {
    apiCalls.push(req);
    return new Response(JSON.stringify(FIXTURE_SEARCH_RESPONSE));
  });

  const res = await dispatch(
    createContext("<@BOT> wikipedia 宇宙"),
  );

  assert(res.type === "message");
  assertMatch(res.text, /^https:\/\/ja\.wikipedia\.org\/\?curid=\d+$/);
});
