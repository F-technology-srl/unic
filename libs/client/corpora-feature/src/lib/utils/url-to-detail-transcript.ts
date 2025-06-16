export function urlToDetalTranscript(
  acronym: string,
  transcript_slug: string,
  match_word: string,
  offsetStart?: number | string | null,
  offsetLength?: number | string | null,
  alignment_slug?: string | null,
): string {
  let detailUrl = `/corpora/${acronym}/${transcript_slug}?word=${match_word}&offset=${offsetStart ?? 0}&offset-length=${offsetLength ?? 0}`;
  if (alignment_slug) {
    detailUrl += `&alignments-slug=${alignment_slug}`;
  }
  return detailUrl;
}
