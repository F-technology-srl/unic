import React, { MutableRefObject } from 'react';
import { Modal, ModalHandle } from './modal';
import { ErrorModalIcon, CheckModalIcon } from '../icons';
import Loader from '../loader/loader';

export interface ModalSubmitProps {
  submitRef: MutableRefObject<ModalHandle | null>;
  onClose?: () => void;
  text?: React.ReactNode;
  type?: 'success' | 'error' | 'loading';
  disableClose?: boolean;
}

export const ModalSubmit = (props: ModalSubmitProps) => {
  return (
    <Modal
      ref={props.submitRef}
      id="submit-form-modal"
      disableOutsideClick={true}
      triggerElement={<span></span>}
      onClose={props.onClose}
      disableClose={props.disableClose}
    >
      <div
        className={`flex flex-col justify-center items-center text-center ${props.type === 'loading' && 'max-h-[400px]'}`}
      >
        {props.type === 'loading' && (
          <>
            <span className="mb-8 pt-8 leading-none text-xl font-semibold text-gray-900 min-w-[352px]">
              Loading...
            </span>
            <Loader notMiddlePage />
          </>
        )}
        {props.type !== 'loading' && (
          <>
            {props.type === 'error' ? <ErrorModalIcon /> : <CheckModalIcon />}
            {props.text}
          </>
        )}
      </div>
    </Modal>
  );
};
