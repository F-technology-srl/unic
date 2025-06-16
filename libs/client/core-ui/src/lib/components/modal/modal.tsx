import { useEffect, useImperativeHandle, useState } from 'react';
import { XIcon } from '../icons';
import React from 'react';

type ModalProps = React.PropsWithChildren<{
  triggerElement?: JSX.Element;
  onOpen?: () => void;
  controlOpen?: boolean;
  id?: string;
  className?: string;
  disableOutsideClick?: boolean;
  disableClose?: boolean;
  onClose?: () => void;
  noPadding?: boolean;
  isHelpModal?: boolean;
}>;

export type ModalHandle = {
  toggleState: () => void;
  closeState: () => void;
};

export const Modal = React.forwardRef<ModalHandle, ModalProps>((props, ref) => {
  const [open, setOpen] = useState(props.controlOpen || false);

  const emitOpenClose = setOpen;

  useImperativeHandle(ref, () => ({
    toggleState() {
      emitOpenClose(!open);
      if (props.onClose && open) {
        props.onClose();
      }
    },
    closeState() {
      emitOpenClose(false);
    },
  }));

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        emitOpenClose(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [emitOpenClose, open]);

  return (
    <>
      {props.triggerElement && (
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
            props.onOpen && props.onOpen();
          }}
        >
          {props.triggerElement}
        </span>
      )}

      {open && (
        <div
          id={props.id}
          className={`fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50`}
          onClick={(e) => {
            if (!props.disableOutsideClick && !props.disableClose) {
              emitOpenClose(false);
              props.onClose && props.onClose();
            }
          }}
          style={{ zIndex: 1000 }} // Assicurati che il modale sia sopra gli altri elementi della pagina
        >
          <div
            className={`bg-white rounded-md w-fit ${props.className || ''} max-h-[90%] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {!props.disableClose && (
              <div
                className="flex p-4 pb-0 w-full justify-end"
                onClick={() => {
                  emitOpenClose(false);
                  props.onClose && props.onClose();
                }}
              >
                <XIcon className={`w-3 h-3 cursor-pointer m-1`} />
              </div>
            )}
            <div
              className={`${!props.noPadding ? `px-8 pb-8` : ''} ${props.isHelpModal ? '' : 'w-[416px]'}`}
            >
              {props.children}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
