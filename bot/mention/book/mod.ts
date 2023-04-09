import { createMentionCommand } from "gbas/mod.ts";

const API_ENDPOINT = "https://www.googleapis.com/books/v1/volumes";

type Book = {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    authors: string[];
    publishedDate: string;
    description: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    readingModes: {
      text: boolean;
      image: boolean;
    };
    pageCount: number;
    printType: string;
    categories: string[];
    maturityRating: string;
    allowAnonLogging: boolean;
    contentVersion: string;
    panelizationSummary: {
      containsEpubBubbles: boolean;
      containsImageBubbles: boolean;
    };
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
    };
    language: string;
    previewLink: string;
    infoLink: string;
    canonicalVolumeLink: string;
  };
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: boolean;
  };
  accessInfo: {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub: {
      isAvailable: boolean;
    };
    pdf: {
      isAvailable: boolean;
    };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: boolean;
  };
  searchInfo: {
    textSnippet: string;
  };
};

type SearchResponse = {
  kind: string;
  totalItems: number;
  items: Book[];
};

export const book = createMentionCommand({
  name: "book",
  examples: ["book <query> - 本を検索する"],
  pattern: /^book\s+(.+)$/i,
  execute: async (c) => {
    const text = c.match[1];
    const res = await fetch(
      `${API_ENDPOINT}?${new URLSearchParams({ q: text, langRestrict: "ja" })}`,
    );
    const { items = [] }: SearchResponse = await res.json();
    const availableBooks = items.filter((item) => {
      return item.volumeInfo.industryIdentifiers?.some((id) =>
        id.type === "ISBN_10"
      );
    });
    if (availableBooks.length === 0) {
      return c.res.message("本が見つからなかったぞ");
    }
    const book = c.randomChoice(availableBooks);
    const isbn = book.volumeInfo.industryIdentifiers?.find((id) =>
      id.type === "ISBN_10"
    )?.identifier;
    return c.res.message(`https://www.amazon.co.jp/dp/${isbn}`);
  },
  outgoingDomains: ["www.googleapis.com"],
});
