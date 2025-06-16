import { Button, EsclamationIcon, Modal } from '@unic/core-ui';

export const HelpModal = () => {
  return (
    <Modal
      className="max-w-[1200px]"
      isHelpModal
      noPadding
      id="submit-form-modal"
      disableOutsideClick={true}
      triggerElement={
        <Button
          icon={[{ icon: <EsclamationIcon />, position: 'center' }]}
          size="xs"
          type="secondary"
          key={`button-help`}
        >
          Help
        </Button>
      }
    >
      <div className="">
        <span className="text-gray-900 text-xl leading-none font-semibold py-5 px-8">
          Use of regex
        </span>
        <div className="w-full h-[1px] bg-gray-200 mt-4"></div>

        <div className="text-gray-500 gap-8 grid grid-cols-1 py-5 px-8">
          <div className=" grid grid-cols-1">
            <div className="leading-none text-xl font-semibold mb-5">
              Punctuations
            </div>

            <div className="flex gap-9 font-bold">
              <div className="flex-[1]">Use</div>
              <div className="flex-[4]">To find</div>
              <div className="flex-[2]">Example</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">{`//`}</div>
              <div className="flex-[4]">the end of a statement</div>
              <div className="flex-[2]">on this issue // -ehm- I</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">?</div>
              <div className="flex-[4]">
                a question; type the question mark in the fullwidth form (全角)
                to search in Chinese, Japanese, and Korean
              </div>
              <div className="flex-[2]">请问您怎么看？</div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="leading-none text-xl font-semibold mb-5">
              Mispronunciations and disfluencies
            </div>

            <div className="flex gap-9 font-bold">
              <div className="flex-[1]">Use</div>
              <div className="flex-[4]">To find</div>
              <div className="flex-[2]">Example</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">~</div>
              <div className="flex-[4]">
                a mispronounced word or non-standard pronunciation
              </div>
              <div className="flex-[2]">~luvly</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">{`<`}</div>
              <div className="flex-[4]">
                the correct form of a mispronounced word or non-standard
                pronunciation
              </div>
              <div className="flex-[2]">{`</lovely/>`}</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">=</div>
              <div className="flex-[4]">a truncated word or a false start</div>
              <div className="flex-[2]">po= partnership</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">:</div>
              <div className="flex-[4]">a lengthened syllable</div>
              <div className="flex-[2]">to:to</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">a space and -</div>
              <div className="flex-[4]">a filled pause</div>
              <div className="flex-[2]">the -hu- the</div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="leading-none text-xl font-semibold mb-5">
              Silent pauses and the lack thereof
            </div>

            <div className="flex gap-9 font-bold">
              <div className="flex-[1]">Use</div>
              <div className="flex-[4]">To find</div>
              <div className="flex-[2]">Example</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">{'['}</div>
              <div className="flex-[4]">an overlap</div>
              <div className="flex-[2]">谢[谢] // [thank] you //</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">(.)</div>
              <div className="flex-[4]">a pause between 0.2 s and 0.5 s</div>
              <div className="flex-[2]">Pakistan (.) la Corea del Sud</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">(..)</div>
              <div className="flex-[4]">a pause between 0.5 s and 1 s</div>
              <div className="flex-[2]">enutosi a Roma (..)</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">{'([0-9])'}</div>
              <div className="flex-[4]">a pause exceeding 1 s</div>
              <div className="flex-[2]">(2.35) signor Presidente</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">(0)</div>
              <div className="flex-[4]">
                a tightly bounded segment or one where a speaker/signer begins
                immediately after another stops
              </div>
              <div className="flex-[2]">
                good afternoon // (0) good afternoon //
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="leading-none text-xl font-semibold mb-5">
              Transcriber's perspectives
            </div>

            <div className="flex gap-9 font-bold">
              <div className="flex-[1]">Use</div>
              <div className="flex-[4]">To find</div>
              <div className="flex-[2]">Example</div>
            </div>

            {/* <div className="flex gap-9">
              <div className="flex-[1]">{`< or >`}</div>
              <div className="flex-[4]">
                a non-verbal vocalisation such as coughing and laughing
              </div>
              <div className="flex-[2]">{`<cough>, <laugh>`}</div>
            </div> */}

            <div className="flex gap-9">
              <div className="flex-[1]">{'(('}</div>
              <div className="flex-[4]">
                information about the context, e.g. background noise, non-verbal
                actions
              </div>
              <div className="flex-[2]">((audience applause)) ((cough))</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">{'((x'}</div>
              <div className="flex-[4]">unintelligible syllables</div>
              <div className="flex-[2]">((x)) from Le Monde</div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">{'((?'}</div>
              <div className="flex-[4]">the transcriber's guesses</div>
              <div className="flex-[2]">((?Raphael))</div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="leading-none text-xl font-semibold mb-5">
              Translational relations
            </div>

            <div className="flex gap-9 font-bold">
              <div className="flex-[1]">Use</div>
              <div className="flex-[4]">To find</div>
              <div className="flex-[2]"></div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">((n/i))</div>
              <div className="flex-[4]">
                an uninterpreted source-speech segment
              </div>
              <div className="flex-[2]"></div>
            </div>

            <div className="flex gap-9">
              <div className="flex-[1]">((n/s))</div>
              <div className="flex-[4]">
                a segment by the interpreter that has no source equivalents
              </div>
              <div className="flex-[2]"></div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
