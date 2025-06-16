import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryController } from './repository.controller';
import { RepositoryService } from '../services';
import { DatabaseModule } from '@unic/database';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { BucketDiskService } from '../services/bucket-disk.service';
import { seedDb } from '../test/db-seed.util';
import * as fs from 'fs';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';
import { AuthService, CryptService } from '@unic/server/authentication-feature';
import {
  allowedAlignmentEstension,
  allowedAnnotationEstension,
  allowedAssocietedFileEstension,
  allowedAudioEstension,
  allowedTextEstension,
  allowedVideoEstension,
  ZipCategory,
} from '@unic/shared/global-types';
import archiver from 'archiver';

let database: StartedPostgreSqlContainer;
describe('RepositoryController Test', () => {
  let repositoryController: RepositoryController;
  let repositoryService: RepositoryService;
  const options = {
    pathTemp: path.join(process.cwd(), 'temp'),
    pathDisk: path.join(process.cwd(), 'uploads'),
  };

  beforeAll(async () => {
    database = await new PostgreSqlContainer().start();
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot(database.getConnectionUri(), {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onnotice: () => {},
        }),
      ],
      providers: [
        RepositoryController,
        RepositoryService,
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        BucketDiskService,
        JwtService,
        AuthService,
        CryptService,
      ],
    }).compile();

    repositoryController =
      testModule.get<RepositoryController>(RepositoryController);
    repositoryService = testModule.get<RepositoryService>(RepositoryService);

    await seedDb(testModule);
  }, 60000);

  afterAll(async () => {
    deleteFolderRecursive(options.pathTemp);
    deleteFolderRecursive(options.pathDisk);
    await database.stop();
  });

  it('should handle a real zip file and extract only allowed files', async () => {
    await importFileAndCheckExtension(
      ZipCategory.transcription,
      allowedTextEstension,
    );
    await importFileAndCheckExtension(ZipCategory.audio, allowedAudioEstension);
    await importFileAndCheckExtension(ZipCategory.video, allowedVideoEstension);
    await importFileAndCheckExtension(
      ZipCategory.associeted_file,
      allowedAssocietedFileEstension,
    );
    await importFileAndCheckExtension(
      ZipCategory.alignment,
      allowedAlignmentEstension,
    );
    await importFileAndCheckExtension(
      ZipCategory.annotation,
      allowedAnnotationEstension,
    );
  });

  async function importFileAndCheckExtension(
    category: ZipCategory,
    allowedExtensions: string[],
  ) {
    // Create a zip file
    const testZipPath = path.join(
      process.cwd(),
      options.pathTemp,
      'test-upload.zip',
    );
    // Ottieni la directory dalla path del file
    const dir = path.dirname(testZipPath);

    // Crea la directory se non esiste
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const output = fs.createWriteStream(testZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    // right extension
    const allowedExtensionFiles = allowedExtensions.map((ext) => {
      return { name: `text${ext}`, content: 'Test content' };
    });
    const wrongExtensionFiles = [
      { name: 'ignore.jpg', content: 'Ignore content' },
      { name: 'esex.exe', content: 'Ignore content' },
    ];

    const filesIntoZip = [...allowedExtensionFiles, ...wrongExtensionFiles];

    for (const file of filesIntoZip) {
      archive.append(file.content, { name: file.name });
    }
    await archive.finalize();

    // Create mock
    const mockFile = {
      path: testZipPath,
      originalname: 'test-folder-zip',
    } as Express.Multer.File;

    const response = await repositoryController.uploadZip(mockFile, category);

    expect(response).toBeDefined();
    expect(response.bucket_uri).toBeDefined();
    expect(response.repository_asset_uuid).toBeDefined();
    expect(response.mime_type).toBe('folder');

    // chekc if file ZIP original is deleted
    // expect(fs.existsSync(testZipPath)).toBe(false);

    // check ogni if right files is extracted
    for (const file of allowedExtensionFiles) {
      const assetItem = await repositoryService.getAssetStreamById(
        response.repository_asset_uuid,
        file.name,
      );
      const actualContent = await repositoryService.streamToString(
        assetItem.stream,
      );
      expect(actualContent).toBe(file.content);
    }

    for (const file of wrongExtensionFiles) {
      expect(
        repositoryService.getAssetStreamById(
          response.repository_asset_uuid,
          file.name,
        ),
      ).rejects.toThrow();
    }
  }

  it('Test if single file handler is working', async () => {
    const testFilePath = path.join(options.pathTemp, 'test_file.txt');
    // Ottieni la directory dalla path del file
    const dir = path.dirname(testFilePath);

    // Crea la directory se non esiste
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'prova test');
    const mockFile = {
      path: testFilePath,
      originalname: 'testfilename',
      mimetype: 'text/plain',
    } as Express.Multer.File;
    const response = await repositoryController.uploadFile(mockFile, '');

    //Get the assets from api
    const assetItem = await repositoryService.getAssetStreamById(
      response.repository_asset_uuid,
    );
    const actualContent = await repositoryService.streamToString(
      assetItem.stream,
    );
    expect(actualContent).toBe('prova test');

    //Delete the file
    await repositoryService.deleteAsset(response.repository_asset_uuid);
    expect(
      repositoryService.getAssetStreamById(response.repository_asset_uuid),
    ).rejects.toThrow();
  });
});

function deleteFolderRecursive(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Ricorsivamente cancella i file nelle sottocartelle
        deleteFolderRecursive(currentPath);
      } else {
        // Cancella il file
        fs.unlinkSync(currentPath);
      }
    });
    // Cancella la cartella dopo aver rimosso tutti i file
    fs.rmdirSync(folderPath);
  }
}
