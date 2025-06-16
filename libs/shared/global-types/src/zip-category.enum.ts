export enum ZipCategory {
  transcription = 'transcription',
  audio = 'audio',
  video = 'video',
  associeted_file = 'associeted_file',
  alignment = 'alignment',
  annotation = 'annotation',
}

export const allowedTextEstension = ['.txt'];
export const allowedAlignmentEstension = ['.json'];
export const allowedAnnotationEstension = [
  '.txt',
  '.xml',
  '.eaf',
  '.textgrid',
  '.exb',
  '.json',
  '.gz',
  '.cha',
  '.html',
  '.tmx',
  '.xlsx',
  '.csv',
  '.tsv',
];
export const allowedAssocietedFileEstension = ['.pdf', '.txt', '.tsv', '.csv'];
export const allowedVideoEstension = ['.mp4'];
export const allowedAudioEstension = ['.mp3', '.wav', '.ogg'];
export const allowedExtensions = new Set([
  ...allowedTextEstension,
  ...allowedAlignmentEstension,
  ...allowedAnnotationEstension,
  ...allowedAssocietedFileEstension,
  ...allowedVideoEstension,
  ...allowedAudioEstension,
]);

export function getAllowedExtensionsFromCategory(
  category: ZipCategory,
): string[] {
  switch (category) {
    case ZipCategory.transcription:
      return allowedTextEstension;
    case ZipCategory.audio:
      return allowedAudioEstension;
    case ZipCategory.video:
      return allowedVideoEstension;
    case ZipCategory.associeted_file:
      return allowedAssocietedFileEstension;
    case ZipCategory.alignment:
      return allowedAlignmentEstension;
    case ZipCategory.annotation:
      return allowedAnnotationEstension;
    default:
      return [];
  }
}
