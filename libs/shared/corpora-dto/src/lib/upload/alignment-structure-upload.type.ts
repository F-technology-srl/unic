export type AlignmentStructureUploadFile = {
  sentences: AlignmentStructureUploadFileData[];
};
export type AlignmentStructureUploadFileData = {
  full_text: string | null;
  start: string | null;
  duration: string | null;
  id: string;
  source_id: string | null;
};
