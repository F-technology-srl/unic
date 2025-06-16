import { ReactNode, useEffect, useRef, useState } from 'react';
import { DeleteIcon, FileIcon, SearchIcon, UploadIcon } from '../icons';
import Button from '../button/button';
import React from 'react';
import { CorporaMetadataStructureJsonValidate } from '@unic/shared/corpora-dto';

export type MinWidthTypes = 'little' | 'medium';

type FileInputStatus = 'idle' | 'uploading' | 'processing' | 'uploaded';

export interface FileInputProps {
  name: string;
  label?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  value?: File[];
  uploadedAssetNames?: string[];
  uploadedJson?: CorporaMetadataStructureJsonValidate | null;
  currentAsset?: string;
  multiple?: boolean;
  loading?: boolean;
  minWidth?: MinWidthTypes;
  onChange: (file: FileList) => void;
  fileCostraints?: {
    label: ReactNode;
    accept: string;
  };
  infoText?: string | JSX.Element;
  acceptJson?: boolean;
  belowContent?: JSX.Element;
  onDelete?: () => void;
  errors?: string | null;
  nameFileDownload?: string;
  maxGBFileSize?: number; //GB
  progress?: number | null;
  onFileToLarge?: () => void;
}
export const FileInput = (props: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileInputStatus, setFileInputStatus] = useState<FileInputStatus>();

  const maxGBFileSize = props.maxGBFileSize ?? 3;

  useEffect(() => {
    if (props.loading) {
      if ((props.progress ?? 0) >= 100) {
        setFileInputStatus('processing');
      } else {
        setFileInputStatus('uploading');
      }
    } else if (
      !props.loading &&
      (props.currentAsset ||
        (props.uploadedAssetNames && props.uploadedAssetNames?.length > 0))
    ) {
      setFileInputStatus('uploaded');
    } else {
      setFileInputStatus('idle');
    }
  }, [
    props.loading,
    props.currentAsset,
    props.uploadedAssetNames,
    props.progress,
  ]);

  const handleFileChange = () => {
    try {
      if (inputRef?.current?.files) {
        if (
          inputRef.current.files[0].size >
          maxGBFileSize * 1024 * 1024 * 1024
        ) {
          props.onFileToLarge?.();
        } else {
          props.onChange(inputRef.current.files);
        }

        inputRef.current.value = ''; // Reset per permettere l'upload dello stesso file
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setFileInputStatus('idle');
    }
  };

  const handleDownloadJSONFile = () => {
    try {
      if (props.uploadedJson) {
        const json = JSON.stringify(props.uploadedJson, null, 2); // Converti l'oggetto in una stringa JSON
        const blob = new Blob([json], { type: 'application/json' }); // Crea un Blob con il JSON
        const url = URL.createObjectURL(blob); // Crea un URL per il Blob

        const link = document.createElement('a');
        link.href = url;
        link.download = props.nameFileDownload ?? 'metadata.json'; // Nome del file da scaricare
        document.body.appendChild(link);
        link.click(); // Simula il clic
        document.body.removeChild(link); // Rimuovi il link dal DOM
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {props.label && (
        <label
          htmlFor={`input-${props.name}`}
          className={`text-sm font-medium ${
            props.disabled ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {props.label}
          <span className="text-red-500 pl-1">{props.required ? '*' : ''}</span>
        </label>
      )}
      <input
        className="hidden"
        type="file"
        multiple={props.multiple}
        ref={inputRef}
        accept={props.fileCostraints?.accept}
        onChange={handleFileChange} // Usa la funzione handleFileChange
        onClick={(e) => {
          e.currentTarget.value = ''; // Reset del valore dell'input al click
        }}
        disabled={props.disabled}
      />
      <div
        className={`flex flex-col w-full gap-2.5 ${
          props.disabled ? 'pointer-events-none' : 'cursor-pointer'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex items-center justify-center w-full gap-[10px] flex-col">
          <label className="flex flex-col items-center justify-center w-full gap-4 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadIcon
                className={`${props.disabled ? 'text-gray-400' : 'text-gray-500'} w-8 h-8`}
              />
              <p
                className={`text-sm dark:text-gray-500 ${props.disabled ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Click here to upload or drag and drop your files{' '}
              </p>
              <p
                className={`text-xs dark:text-gray-500 font-semibold ${props.disabled ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Max. File Size: {maxGBFileSize}GB
              </p>
            </div>
            <Button
              className={`text-white py-spacer-12 pl-spacer-20 pr-spacer-16 ${
                props.currentAsset ? 'bg-green-dark' : 'bg-dark-2'
              } rounded-tl-6 rounded-bl-6 min-w-[125px]`}
              type="primary"
              size="xs"
              icon={[
                { position: 'left', icon: <SearchIcon className="w-4 h-4" /> },
              ]}
              disabled={props.disabled}
            >
              Browse File
            </Button>
          </label>
        </div>
      </div>
      {props.uploadedJson && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 w-full p-4">
          <div className="flex flex-row gap-2 justify-between px-4 py-[14px] bg-white rounded-sm items-center">
            <div
              className="gap-2 flex flex-row items-center cursor-pointer"
              onClick={props.uploadedJson ? handleDownloadJSONFile : undefined}
            >
              <FileIcon className="text-gray-900 w-[42px] h-[42px]" />
              <span>{props.uploadedAssetNames?.[0] ?? props.belowContent}</span>
            </div>
            {!props.disabled && (
              <DeleteIcon
                className="text-gray-800 cursor-pointer border border-gray-200 rounded-lg p-2 w-[38px] h-[38px]"
                onClick={props.onDelete}
              />
            )}
          </div>
        </div>
      )}

      {(props.progress || props.uploadedAssetNames) && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 w-full p-4">
          <div>
            <span className="text-sm font-medium text-gray-900">
              {props.uploadedAssetNames?.[0]}
            </span>
          </div>
          {props.progress && (
            <div>
              <div className="flex justify-between ">
                <span className=""></span>
                <span className="text-xs font-medium text-gray-500 mb-1">
                  {fileInputStatus === 'uploading'
                    ? ` ${props.progress?.toFixed(2)}%`
                    : ''}
                  {fileInputStatus === 'processing' ? ` Processing...` : ''}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className={`${props.errors ? 'bg-red-500' : fileInputStatus === 'uploaded' ? 'bg-green-400' : 'bg-blue-600'} h-1.5 rounded-full `}
                  style={{ width: `${props.progress?.toFixed(2)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {props.errors && (
        <p className="text-xs text-red-500">
          Error uploading file: {String(props.errors)}
        </p>
      )}
      {props.infoText && (
        <span
          className={`text-xs ${
            props.disabled ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {props.infoText}
        </span>
      )}
    </div>
  );
};

export default FileInput;
