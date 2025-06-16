export function generateSlug(acronym: string, isWriting = false): string {
  if (!acronym) {
    return '';
  }
  const acronymRet = acronym
    .toLowerCase() // Converte tutto in minuscolo
    .trim() // Rimuove spazi all'inizio e alla fine
    .replace(/[\s\W-]+/g, '-'); // Sostituisce spazi e caratteri speciali con un trattino

  if (isWriting) {
    return acronymRet;
  }
  return acronymRet.replace(/^-+|-+$/g, ''); // Rimuove eventuali trattini all'inizio e alla fine
}
