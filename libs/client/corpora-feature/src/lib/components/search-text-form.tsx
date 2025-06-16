import 'reflect-metadata';
import { Button, InputTextFormInput, SearchIcon } from '@unic/core-ui';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CorporaFilterSearchDto } from '@unic/shared/corpora-dto';
import { FormProvider, useForm } from 'react-hook-form';
import { checkSearchCharactersIsValid } from '@unic/shared/global-types';

const resolver = classValidatorResolver(CorporaFilterSearchDto);

export interface SearchTextProps {
  onSubmit: (data: { search?: string }) => void;
}

export const SearchTextForm = (props: SearchTextProps) => {
  const formMethods = useForm<{ search?: string }>({
    resolver,
    defaultValues: {
      search: '',
    },
  });

  const searchValue = formMethods.watch('search');

  return (
    <div className="">
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(props.onSubmit)}
          className="flex flex-col gap-10"
        >
          <div className="flex flex-row gap-2.5 items-end">
            <InputTextFormInput
              name="search"
              placeholder="Search"
              label="Search"
              type="search"
              className={'w-[325px]'}
              key="search-input"
            />
            <Button
              isSubmit
              icon={[{ icon: <SearchIcon />, position: 'center' }]}
              type="primary"
              size="regular"
              key="submit-search-button"
              disabled={
                formMethods.formState.isSubmitting ||
                !checkSearchCharactersIsValid(searchValue)
              }
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
