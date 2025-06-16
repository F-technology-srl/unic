import {
  CorporaMetadataStatusEnum,
  getNameLanguageFromId,
} from '@unic/shared/database-dto';
import { useGetCorporaMetadata } from '../data-access';
import {
  BodyTextContent,
  EmailToIcon,
  H3,
  KeyValueTable,
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@unic/core-ui';

export const ReadmeCorporaPage = (props: { acronym: string }) => {
  const { data } = useGetCorporaMetadata(
    props.acronym,
    CorporaMetadataStatusEnum.current,
    false,
  );

  const removeRole = (contributor: string) =>
    contributor.replace(/\s?\([a-zA-Z]+\)/, '');
  const transcribers =
    data?.contributors
      ?.filter((contributor) => contributor.includes('(transcriber)'))
      .map((contributor) => removeRole(contributor)) || [];
  const annotators =
    data?.contributors
      ?.filter((contributor) => contributor.includes('(annotator)'))
      .map((contributor) => removeRole(contributor)) || [];
  const aligners =
    data?.contributors
      ?.filter((contributor) => contributor.includes('(aligner)'))
      .map((contributor) => removeRole(contributor)) || [];
  const maxLengthContributors =
    data?.creator?.length &&
    Math.max(
      transcribers.length,
      annotators.length,
      aligners.length,
      data?.creator?.length,
    );

  const listPlLeft = 'list-disc pl-6';

  return (
    <div className="grid grid-cols-1 gap-8">
      <h1 className="text-4xl font-semibold leading-none">
        {data?.name} ({data?.acronym?.toUpperCase()}){' '}
        {data?.version && `v${data.version}`}
      </h1>
      {data?.description && (
        <div className="grid grid-cols-1 gap-5">
          <H3 className="text-gray-900">Description</H3>
          <BodyTextContent className="text-gray-600">
            {data?.description}
          </BodyTextContent>
        </div>
      )}
      {data?.publication_date && (
        <div className="grid grid-cols-1 gap-5">
          <H3 className="text-gray-900">Publication date</H3>
          <BodyTextContent className="text-gray-900">
            {data?.publication_date}
          </BodyTextContent>
        </div>
      )}
      {data?.citation && (
        <div className="grid grid-cols-1 gap-5">
          <H3 className="text-gray-900">How to cite</H3>
          <BodyTextContent className="text-gray-500">
            {data?.citation}
          </BodyTextContent>
        </div>
      )}
      {data?.distribution && data.distribution.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          <H3 className="text-gray-900">Distribution</H3>
          <BodyTextContent className="text-gray-500">
            Available at{' '}
            {data?.distribution?.map((url, index) => (
              <span key={index}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {url}
                </a>
                {index < (data?.distribution?.length ?? 0) - 1 && ' '}
              </span>
            ))}
          </BodyTextContent>
        </div>
      )}
      {data?.funding_information && (
        <div className="grid grid-cols-1 gap-5">
          <H3 className="text-gray-900">Funding information</H3>
          <BodyTextContent className="text-gray-500">
            {data?.funding_information}
          </BodyTextContent>
        </div>
      )}
      {typeof maxLengthContributors === 'number' &&
        maxLengthContributors > 0 && (
          <div className="grid grid-cols-1 gap-5">
            <H3 className="text-gray-900">Persons involved</H3>
            <Table>
              <TableHeader>
                <span>CREATOR(S)</span>
                <span>TRANSCRIBER(S)</span>
                <span>ANNOTATOR(S)</span>
                <span>ALIGNER(S)</span>
              </TableHeader>
              <TableBody>
                {[...Array(maxLengthContributors)].map((_, index) => (
                  <TableRow key={index}>
                    <div className="flex gap-2">
                      <span>{data?.creator[index]}</span>

                      {data?.contact_information?.[index] &&
                        (data?.creator?.length ===
                        data?.contact_information?.length ? (
                          <a
                            href={`mailto:${data?.contact_information?.[index]}`}
                          >
                            <EmailToIcon />
                          </a>
                        ) : (
                          index === 0 &&
                          data?.contact_information.map((email, i) => (
                            <a key={i} href={`mailto:${email}`}>
                              <EmailToIcon />
                            </a>
                          ))
                        ))}
                    </div>

                    <span>{transcribers[index]}</span>
                    <span>{annotators[index]}</span>
                    <span>{aligners[index]}</span>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

      <div className="grid grid-cols-1 gap-5">
        <H3 className="text-gray-900">Interpreting-related information</H3>
        <KeyValueTable
          data={[
            {
              label: 'SOURCE LANGUAGE(S):',
              value:
                data?.source_language
                  ?.map((w) => getNameLanguageFromId(w))
                  .join(', ') ?? '',
            },
            {
              label: 'TARGET LANGUAGE(S):',
              value:
                data?.target_language
                  ?.map((w) => getNameLanguageFromId(w))
                  .join(', ') ?? '',
            },
            {
              label: 'TOPIC DOMAIN(S):',
              value: data?.topic_domain?.join(', ') ?? '',
            },
            {
              label: 'WORKING MODE(S):',
              value: data?.working_mode?.join(', ') ?? '',
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-5">
        <H3 className="text-gray-900">Size information</H3>
        <Table>
          <TableHeader>
            <span>DISK MEMORY</span>
            <span>N. OF TOKENS AND GLOSSES</span>
            <span>N. OF MEDIA FILES</span>
            <span>N. OF INTERPRETERS</span>
            <span>DURATION</span>
          </TableHeader>
          <TableBody>
            <TableRow>
              <span>
                {data?.size_disk_memory ? data.size_disk_memory : 'NA'}
              </span>
              <span>{data?.size_tokens ? data.size_tokens : 'NA'}</span>
              <span>{data?.number_of_files ? data.number_of_files : 'NA'}</span>
              <span>
                {data?.number_of_interpreters
                  ? data.number_of_interpreters
                  : 'NA'}
              </span>
              <span>{data?.duration ? data.duration : 'NA'}</span>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-1 gap-5">
        <H3 className="text-gray-900">Corpus processing</H3>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-3.5">
            <BodyTextContent className="text-gray-900">
              Anonymisation
            </BodyTextContent>
            <ul className={listPlLeft}>
              <li className="text-gray-500 text-base">
                {data?.anonymization === 'true'
                  ? 'Anonymised'
                  : 'Not anonymised'}
                {data?.anonymization_description && (
                  <ul className={listPlLeft}>
                    <li className="text-gray-500">
                      {data?.anonymization_description}
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-3.5">
            <BodyTextContent className="text-gray-900">
              Transcription
            </BodyTextContent>
            <ul className={listPlLeft}>
              <li className="text-gray-500 text-base">
                {data?.transcription_status === 'no'
                  ? 'Not transcribed'
                  : data?.transcription_status === 'fully'
                    ? 'Fully transcribed'
                    : 'Partially transcribed'}
                {data?.transcription_status !== 'no' && (
                  <ul className={listPlLeft}>
                    <li className="text-gray-500 text-base">
                      {data?.transcription_description}
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-3.5">
            <BodyTextContent className="text-gray-900">
              Annotation
            </BodyTextContent>
            <ul className={listPlLeft}>
              <li className="text-gray-500 text-base">
                {data?.annotation_status === 'no'
                  ? 'Not annotated'
                  : data?.annotation_status === 'fully'
                    ? 'Fully annotated'
                    : 'Partially annotated'}
                {data?.annotation_status !== 'no' && (
                  <ul className={listPlLeft}>
                    <li className="text-gray-500 text-base">
                      {data?.annotation_status_description}
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-3.5">
            <BodyTextContent className="text-gray-900">
              Alignment
            </BodyTextContent>
            <ul className={listPlLeft}>
              <li className="text-gray-500 text-base">
                {data?.alignment_status === 'no'
                  ? 'Not aligned'
                  : data?.alignment_status === 'fully'
                    ? 'Fully aligned'
                    : 'Partially aligned'}
                {data?.alignment_status !== 'no' &&
                  data?.aligment_status_description && (
                    <ul className={listPlLeft}>
                      <li className="text-gray-500 text-base">
                        {data?.aligment_status_description}
                      </li>
                    </ul>
                  )}
              </li>
            </ul>
          </div>
        </div>
      </div>
      {data?.availability !== 'closed' && data?.license && data.license_url && (
        <div className="grid grid-cols-1 gap-5">
          <H3 className="text-gray-900">Licence</H3>
          <BodyTextContent className="text-gray-500">
            {data?.name} {data?.version && `v${data.version}`} is available
            under the {data?.license} licence. See{' '}
            <a
              className="underline"
              href={data?.license_url || ''}
              target="__blank"
            >
              {data?.license_url}
            </a>
            .
          </BodyTextContent>
        </div>
      )}
    </div>
  );
};
