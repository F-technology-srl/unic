import { DatabaseModule } from '@unic/database';
import { CorporaSearchService } from './corpora-search.service';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { seedDb } from '../test/db-seed.util';
import {
  ResultCorporaSearch,
  ResultCorporaSearchRow,
} from '@unic/shared/corpora-dto';

let database: StartedPostgreSqlContainer;
let transcriptUUIDTestOne = '';
let transcriptUUIDTestCamelCase = '';
let transcriptUUIDTestDoubleSlash = '';
let transcriptUUIDTestQuestionMark = '';
let transcriptUUIDTestTilde = '';
let transcriptUUIDTestGreatenLessSlashOperator = '';
let transcriptUUIDEqualCharacter = '';
let transcriptUUIDColonsCharacter = '';
let transcriptUUIDSpaceAndMinus = '';
let transcriptUUIDSingleSquare = '';
let transcriptUUIDSmallPause = '';
let transcriptUUIDMediumPause = '';
let transcriptUUIDLongPause = '';
let transcriptUUIDStopPause = '';
let transcriptUUIDVocalisation = '';
let transcriptUUIDBackground = '';
let transcriptUUIDUnintelligibleSyllables = '';
let transcriptUUIDGuesses = '';
let transcriptUUIDUninterpretedSegment = '';
let transcriptUUIDNoEquivalentsSegment = '';

let transcriptUUIDWithAlignment = '';
let alignmentTranscriptUUIDWithAlignment = '';
let transcriptUUIDWithNoAlignment = '';

describe('CorporaSearchService', () => {
  let corporaSearchService: CorporaSearchService;

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [CorporaSearchService],
    }).compile();

    corporaSearchService =
      testModule.get<CorporaSearchService>(CorporaSearchService);

    const {
      transcriptSearchOne,
      transcriptSearchCamelCase,
      transcriptSearchDoubleSlash,
      transcriptSearchQuestionMark,
      transcriptSearchTilde,
      transcriptSearchGreatenLessSlashOperator,
      transcriptSearchEqualCharacter,
      transcriptSearchColons,
      transcriptSearchSpaceAndMinus,
      transcriptSingleSquare,
      transcriptSmallPause,
      transcriptMediumPause,
      transcriptLongPause,
      transcriptStopPause,
      transcriptVocalisation,
      transcriptBackground,
      transcriptUnintelligibleSyllables,
      transcriptGuesses,
      transcriptUninterpretedSegment,
      transcriptNoEquivalentsSegment,
      transcriptSearchAlignment,
      alignmentSearch3,
      transcriptSearchNoAlignment,
    } = await seedDb(testModule);

    transcriptUUIDTestOne = transcriptSearchOne.transcript_uuid;
    transcriptUUIDTestCamelCase = transcriptSearchCamelCase.transcript_uuid;
    transcriptUUIDTestDoubleSlash = transcriptSearchDoubleSlash.transcript_uuid;
    transcriptUUIDTestQuestionMark =
      transcriptSearchQuestionMark.transcript_uuid;
    transcriptUUIDTestTilde = transcriptSearchTilde.transcript_uuid;
    transcriptUUIDTestGreatenLessSlashOperator =
      transcriptSearchGreatenLessSlashOperator.transcript_uuid;
    transcriptUUIDEqualCharacter =
      transcriptSearchEqualCharacter.transcript_uuid;
    transcriptUUIDColonsCharacter = transcriptSearchColons.transcript_uuid;
    transcriptUUIDSpaceAndMinus = transcriptSearchSpaceAndMinus.transcript_uuid;
    transcriptUUIDSingleSquare = transcriptSingleSquare.transcript_uuid;

    transcriptUUIDSmallPause = transcriptSmallPause.transcript_uuid;
    transcriptUUIDMediumPause = transcriptMediumPause.transcript_uuid;
    transcriptUUIDLongPause = transcriptLongPause.transcript_uuid;
    transcriptUUIDStopPause = transcriptStopPause.transcript_uuid;
    transcriptUUIDVocalisation = transcriptVocalisation.transcript_uuid;
    transcriptUUIDBackground = transcriptBackground.transcript_uuid;
    transcriptUUIDUnintelligibleSyllables =
      transcriptUnintelligibleSyllables.transcript_uuid;
    transcriptUUIDGuesses = transcriptGuesses.transcript_uuid;
    transcriptUUIDUninterpretedSegment =
      transcriptUninterpretedSegment.transcript_uuid;
    transcriptUUIDNoEquivalentsSegment =
      transcriptNoEquivalentsSegment.transcript_uuid;

    transcriptUUIDWithAlignment = transcriptSearchAlignment.transcript_uuid;
    alignmentTranscriptUUIDWithAlignment = alignmentSearch3.alignment_uuid;
    transcriptUUIDWithNoAlignment = transcriptSearchNoAlignment.transcript_uuid;
  }, 60000);

  afterAll(async () => {
    await database.stop();
  });

  /*
  it('Check calculation of offset is right', async () => {
    const listOfSearch: ResultCorporaSearch[] = [
      {
        transcript_uuid: '100',
        corpora_uuid: '1',
        full_text:
          '女士们，先生们，上午好 // 我们非常荣幸和高兴的邀请新任国务院总理温家宝与大家见面，并回答记者的提问 // 我们还非常高兴地邀请副总理黄菊、吴仪、曾培炎、回良玉与大家见面 // 现在请温总理给大家先讲几句话 // ',
        match_word: '常',
        offsetStart: 0,
        offsetEnd: 0,
      },
      {
        transcript_uuid: '101',
        corpora_uuid: '1',
        full_text:
          '女士们，先生们，上午好 // 我们非常荣幸和高兴的邀请新任国务院总理温家宝与大家见面，并回答记者的提问 // 我们还非常高兴地邀请副总理黄菊、吴仪、曾培炎、回良玉与大家见面 // 现在请温总理给大家先讲几句话 // ',
        match_word: '常',
        offsetStart: 0,
        offsetEnd: 0,
      },
      {
        transcript_uuid: '102',
        corpora_uuid: '1',
        full_text:
          'bc poi aggiungo revak di dio con un diore che alterni i nostri alremi 2004 alremi ',
        match_word: 'aggiungo',
        offsetStart: 0,
        offsetEnd: 0,
      },
      {
        transcript_uuid: '103',
        corpora_uuid: '2',
        full_text:
          'bc poi aggiungo revak di dio con un diore che alterni i nostri alremi 2004 alremi ',
        match_word: 'alterni',
        offsetStart: 0,
        offsetEnd: 0,
      },
    ];

    const results =
      await corporaSearchService.calculateOffsetFromResult(listOfSearch);
    checkOffsetOnFullTextAndDuplicate(results);
  });
  */

  function checkOffsetOnFullTextAndDuplicate(
    results?: ResultCorporaSearchRow | ResultCorporaSearchRow[],
    expectedWord?: string,
  ) {
    if (!results) {
      return;
    }
    const arrayCheck = Array.isArray(results) ? results : [results];
    //check if the offset is right and match the match_word
    for (const result of arrayCheck) {
      expect(expectedWord?.toLocaleLowerCase()).toBe(
        result.search_item.match_word,
      );
    }

    //no need to check
    if (arrayCheck.length === 1) {
      return;
    }

    //check if no duplicates with same id and same offset
    function findDuplicate(arr: ResultCorporaSearchRow[]) {
      return arr.filter((item, index) => {
        return arr.some((otherItem, otherIndex) => {
          return (
            otherIndex !== index &&
            item.search_item.transcript_uuid ===
              otherItem.search_item.transcript_uuid &&
            item.search_item.offsetStart === otherItem.search_item.offsetStart
          );
        });
      });
    }

    expect(findDuplicate(arrayCheck)).toEqual([]);
  }

  it('Check conversion of search to postgres wildcards', async () => {
    const wordToSearchExample1 = 'agg';

    //CHECK ASTERISK
    //one word with asterisk start end
    const textSearchStartEnd = `*${wordToSearchExample1}*`;
    expect(
      corporaSearchService.convertItemSearchToPostgressWildcards(
        textSearchStartEnd,
      ),
    ).toBe(`\\w*${wordToSearchExample1}\\w*`);

    //one word with asterisk start
    const textSearchStart = `*${wordToSearchExample1}`;
    expect(
      corporaSearchService.convertItemSearchToPostgressWildcards(
        textSearchStart,
      ),
    ).toBe(`\\w*${wordToSearchExample1}\\s`);

    //one word with asterisk start
    const textSearchEnd = `${wordToSearchExample1}*`;
    expect(
      corporaSearchService.convertItemSearchToPostgressWildcards(textSearchEnd),
    ).toBe(`\\m${wordToSearchExample1}\\w*`);

    //multiple same word to check if the conversion is right and not conflict with other words
    const wordToSearchExample2 = `*${wordToSearchExample1}* *${wordToSearchExample1} ${wordToSearchExample1}*`;
    expect(
      corporaSearchService.convertItemSearchToPostgressWildcards(
        wordToSearchExample2,
      ),
    ).toBe(
      `\\w*${wordToSearchExample1}\\w* \\w*${wordToSearchExample1}\\s \\m${wordToSearchExample1}\\w*`,
    );

    //CHECK PIPE
    //multiple different word to check if the conversion is right and not conflict with other words
    expect(
      corporaSearchService.convertItemSearchToPostgressWildcards(
        `andiamo | avanti | rele*`,
      ),
    ).toBe(`andiamo|avanti|\\mrele\\w*`);

    expect(
      corporaSearchService.convertItemSearchToPostgressWildcards(
        `andiamo|avanti|rele*`,
      ),
    ).toBe(`andiamo|avanti|\\mrele\\w*`);
  });

  it('Check if postgres search is right', async () => {
    const results =
      await corporaSearchService.searchTextInTranscriptDatabase('Messico');
    expect(results.length).toBe(1);
    expect(results[0].transcript_uuid).toBe(transcriptUUIDTestOne);
  });

  it('Check if the full flow to search corpora is right', async () => {
    const results =
      await corporaSearchService.searchFullTextTranscript('Messico');
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.find(
        (item) => item.search_item.transcript_uuid == transcriptUUIDTestOne,
      ),
    ).toBeDefined();

    const resultsCamelCase =
      await corporaSearchService.searchFullTextTranscript('Pres*');

    expect(resultsCamelCase.length).toBeGreaterThanOrEqual(3);
    expect(
      resultsCamelCase.filter(
        (item) =>
          item.search_item.transcript_uuid == transcriptUUIDTestCamelCase,
      ).length,
    ).toBe(3);

    const checkOffesets = resultsCamelCase.filter(
      (item) => item.search_item.transcript_uuid == transcriptUUIDTestCamelCase,
    );

    expect(checkOffesets[0].search_item.offsetStart).not.toBe(
      checkOffesets[1].search_item.offsetStart,
    );
  });

  it('Check postgres search when no result', async () => {
    const results =
      await corporaSearchService.searchTextInTranscriptDatabase('Mexico');
    expect(results.length).toBe(0);
  });

  it('Check if // is found', async () => {
    const results = await corporaSearchService.searchFullTextTranscript('//');
    expect(
      results.find(
        (item) =>
          item.search_item.transcript_uuid === transcriptUUIDTestDoubleSlash,
      ),
    ).toBeDefined();

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('//')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDTestDoubleSlash,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(74);
    expect(resultFullMatch?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '//');

    const resultFullMatch2 = (
      await corporaSearchService.searchFullTextTranscript(' // ')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDTestDoubleSlash,
    );
    expect(resultFullMatch2).toBeDefined();
    expect(resultFullMatch2?.search_item.offsetStart).toBe(73);
    expect(resultFullMatch2?.search_item.offsetLength).toBe(4);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch2, ' // ');
  });

  it('Check if ? is found', async () => {
    const results = await corporaSearchService.searchFullTextTranscript('?');
    expect(
      results.find(
        (item) =>
          item.search_item.transcript_uuid === transcriptUUIDTestQuestionMark,
      ),
    ).toBeDefined();

    const resultsQuestionMarkOriental =
      await corporaSearchService.searchFullTextTranscript('全角');
    expect(
      resultsQuestionMarkOriental.find(
        (item) =>
          item.search_item.transcript_uuid === transcriptUUIDTestQuestionMark,
      ),
    ).toBeDefined();

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('?')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDTestQuestionMark,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(19);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, '?');

    const resultPartialMatch3 = (
      await corporaSearchService.searchFullTextTranscript('chiami?')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDTestQuestionMark,
    );
    expect(resultPartialMatch3).toBeDefined();
    expect(resultPartialMatch3?.search_item.offsetStart).toBe(13);
    expect(resultPartialMatch3?.search_item.offsetLength).toBe(7);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch3, 'chiami?');

    const resultPartialMatch2 = (
      await corporaSearchService.searchFullTextTranscript('全角')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDTestQuestionMark,
    );
    expect(resultPartialMatch2).toBeDefined();
    expect(resultPartialMatch2?.search_item.offsetStart).toBe(119);
    expect(resultPartialMatch2?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch2, '全角');
  });

  it('Check if ~ is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript('~')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDTestTilde,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(52);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, '~');

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('~luv')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDTestTilde,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(52);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(4);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, '~luv');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('~luvly')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDTestTilde,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(52);
    expect(resultFullMatch?.search_item.offsetLength).toBe(6);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '~luvly');
  });

  it('Check if </ and /> is found', async () => {
    const resultPartialMatchOpen = (
      await corporaSearchService.searchFullTextTranscript('<')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDTestGreatenLessSlashOperator,
    );
    expect(resultPartialMatchOpen).toBeDefined();
    expect(resultPartialMatchOpen?.search_item.offsetStart).toBe(71);
    expect(resultPartialMatchOpen?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatchOpen, '<');

    const resultPartialMatchOpen2 = (
      await corporaSearchService.searchFullTextTranscript('</')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDTestGreatenLessSlashOperator,
    );
    expect(resultPartialMatchOpen2).toBeDefined();
    expect(resultPartialMatchOpen2?.search_item.offsetStart).toBe(71);
    expect(resultPartialMatchOpen2?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatchOpen2, '</');

    const resultPartialMatchClose = (
      await corporaSearchService.searchFullTextTranscript('>')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDTestGreatenLessSlashOperator,
    );
    expect(resultPartialMatchClose).toBeDefined();
    expect(resultPartialMatchClose?.search_item.offsetStart).toBe(80);
    expect(resultPartialMatchClose?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatchClose, '>');

    const resultPartialMatchClose1 = (
      await corporaSearchService.searchFullTextTranscript('/>')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDTestGreatenLessSlashOperator,
    );
    expect(resultPartialMatchClose1).toBeDefined();
    expect(resultPartialMatchClose1?.search_item.offsetStart).toBe(79);
    expect(resultPartialMatchClose1?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatchClose1, '/>');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('</lovely/>')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDTestGreatenLessSlashOperator,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(71);
    expect(resultFullMatch?.search_item.offsetLength).toBe(10);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '</lovely/>');
  });

  it('Check if = is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript('=')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDEqualCharacter,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(36);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, '=');

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('po=')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDEqualCharacter,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(34);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, 'po=');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('po= partnership')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDEqualCharacter,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(34);
    expect(resultFullMatch?.search_item.offsetLength).toBe(15);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, 'po= partnership');
  });

  it('Check if : is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript(':')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDColonsCharacter,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(24);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, ':');

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('to:')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDColonsCharacter,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(22);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, 'to:');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('to:to')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDColonsCharacter,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(22);
    expect(resultFullMatch?.search_item.offsetLength).toBe(5);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, 'to:to');
  });

  it('Check if space and - is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript(' -')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDSpaceAndMinus,
    );
    expect(resultPartialMatch).toBeDefined();
    console.log('sadsad', resultPartialMatch);
    expect(resultPartialMatch?.search_item.offsetStart).toBe(15);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, ' -');

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('-')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDSpaceAndMinus,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(16);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, '-');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('-uh-')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDSpaceAndMinus,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(16);
    expect(resultFullMatch?.search_item.offsetLength).toBe(4);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '-uh-');
  });

  it('Check if [ or ] is found', async () => {
    const resultOpen = (
      await corporaSearchService.searchFullTextTranscript('[')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDSingleSquare,
    );
    expect(resultOpen).toBeDefined();
    expect(resultOpen?.search_item.offsetStart).toBe(20);

    const resultClose = (
      await corporaSearchService.searchFullTextTranscript(']')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDSingleSquare,
    );
    expect(resultClose).toBeDefined();
    expect(resultClose?.search_item.offsetStart).toBe(26);

    const resultFull = (
      await corporaSearchService.searchFullTextTranscript('[thank]')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDSingleSquare,
    );
    expect(resultFull).toBeDefined();
    expect(resultFull?.search_item.offsetStart).toBe(20);
    expect(resultFull?.search_item.offsetLength).toBe(7);
  });

  it('Check if (.) is found', async () => {
    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('(.)')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDSmallPause,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(42);
    expect(resultFullMatch?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '(.)');
  });

  it('Check if (..) is found', async () => {
    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('(..)')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDMediumPause,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(45);
    expect(resultFullMatch?.search_item.offsetLength).toBe(4);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '(..)');
  });

  it('Check if ([1-9] is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript('(2')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDLongPause,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(23);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, '(2');

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('(2.')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDLongPause,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(23);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, '(2.');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('(2.35)')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDLongPause,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(23);
    expect(resultFullMatch?.search_item.offsetLength).toBe(6);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '(2.35)');
  });

  it('Check if (0) is found', async () => {
    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('(0)')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDStopPause,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(116);
    expect(resultFullMatch?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '(0)');
  });

  it('Check if < or > is found', async () => {
    const resultPartialMatchOpen = (
      await corporaSearchService.searchFullTextTranscript('<')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDVocalisation,
    );
    expect(resultPartialMatchOpen).toBeDefined();
    expect(resultPartialMatchOpen?.search_item.offsetStart).toBe(58);
    expect(resultPartialMatchOpen?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatchOpen, '<');

    const resultPartialMatchClose = (
      await corporaSearchService.searchFullTextTranscript('>')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDVocalisation,
    );
    expect(resultPartialMatchClose).toBeDefined();
    expect(resultPartialMatchClose?.search_item.offsetStart).toBe(64);
    expect(resultPartialMatchClose?.search_item.offsetLength).toBe(1);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatchClose, '>');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('<cough>')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDVocalisation,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(58);
    expect(resultFullMatch?.search_item.offsetLength).toBe(7);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '<cough>');
  });

  it('Check if (( is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript('((')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDBackground,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(75);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(2);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, '((');

    const resultPartialMatch1 = (
      await corporaSearchService.searchFullTextTranscript('((audience')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDBackground,
    );
    expect(resultPartialMatch1).toBeDefined();
    expect(resultPartialMatch1?.search_item.offsetStart).toBe(75);
    expect(resultPartialMatch1?.search_item.offsetLength).toBe(10);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch1, '((audience');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript(
        '((audience applause))',
      )
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDBackground,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(75);
    expect(resultFullMatch?.search_item.offsetLength).toBe(21);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '((audience applause))');
  });

  it('Check if ((x is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript('((x')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDUnintelligibleSyllables,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(27);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, '((x');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('((x))')
    ).find(
      (item) =>
        item.search_item.transcript_uuid ===
        transcriptUUIDUnintelligibleSyllables,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(27);
    expect(resultFullMatch?.search_item.offsetLength).toBe(5);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '((x))');
  });

  it('Check if ((? is found', async () => {
    const resultPartialMatch = (
      await corporaSearchService.searchFullTextTranscript('((?')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDGuesses,
    );
    expect(resultPartialMatch).toBeDefined();
    expect(resultPartialMatch?.search_item.offsetStart).toBe(28);
    expect(resultPartialMatch?.search_item.offsetLength).toBe(3);
    checkOffsetOnFullTextAndDuplicate(resultPartialMatch, '((?');

    const resultFullMatch = (
      await corporaSearchService.searchFullTextTranscript('((?Raphael))')
    ).find(
      (item) => item.search_item.transcript_uuid === transcriptUUIDGuesses,
    );
    expect(resultFullMatch).toBeDefined();
    expect(resultFullMatch?.search_item.offsetStart).toBe(28);
    expect(resultFullMatch?.search_item.offsetLength).toBe(12);
    checkOffsetOnFullTextAndDuplicate(resultFullMatch, '((?Raphael))');
  });

  it('Check if ((n/i)) is found', async () => {
    const result = (
      await corporaSearchService.searchFullTextTranscript('((n/i))')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDUninterpretedSegment,
    );
    expect(result).toBeDefined();
    expect(result?.search_item.offsetStart).toBe(40);
    expect(result?.search_item.offsetLength).toBe(7);
    checkOffsetOnFullTextAndDuplicate(result, '((n/i))');
  });

  it('Check if ((n/s)) is found', async () => {
    const result = (
      await corporaSearchService.searchFullTextTranscript('((n/s))')
    ).find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDNoEquivalentsSegment,
    );
    expect(result).toBeDefined();
    expect(result?.search_item.offsetStart).toBe(62);
    expect(result?.search_item.offsetLength).toBe(7);
    checkOffsetOnFullTextAndDuplicate(result, '((n/s))');
  });

  it('Check if alignmnets search is working', async () => {
    const results =
      await corporaSearchService.searchFullTextTranscript('Lorem Ipsum');
    //expect we found just one result (only alignment)
    expect(
      results.filter(
        (item) =>
          item.search_item.transcript_uuid === transcriptUUIDWithAlignment,
      ).length,
    ).toBe(1);
    const resultAlignment = results.find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDWithAlignment,
    );
    expect(resultAlignment).toBeDefined();

    //found the alignment
    expect(resultAlignment?.search_item.alignment_uuid).toBe(
      alignmentTranscriptUUIDWithAlignment,
    );
    expect(resultAlignment?.search_item.offsetStart).toBe(0);
    expect(resultAlignment?.search_item.offsetLength).toBe(11);
    checkOffsetOnFullTextAndDuplicate(resultAlignment, 'Lorem Ipsum');

    //expect to found another result with no aligmente
    const resultNoAlignment = results.find(
      (item) =>
        item.search_item.transcript_uuid === transcriptUUIDWithNoAlignment,
    );
    expect(resultNoAlignment?.search_item.alignment_uuid).toBeUndefined();
    expect(resultNoAlignment?.search_item.offsetStart).toBe(62);
    expect(resultNoAlignment?.search_item.offsetLength).toBe(11);
    checkOffsetOnFullTextAndDuplicate(resultNoAlignment, 'Lorem Ipsum');
  });
});
