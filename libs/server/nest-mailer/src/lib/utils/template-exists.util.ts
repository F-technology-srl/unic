import { stat } from 'fs';
import { join } from 'path';

export async function checkIfTemplateExists(
  templateName: string,
  basePath: string,
): Promise<boolean> {
  return new Promise((res) => {
    const templpath = join(basePath, templateName);
    stat(templpath, (err) => {
      res(!err);
    });
  });
}
