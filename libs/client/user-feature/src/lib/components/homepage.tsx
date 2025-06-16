import { Card, Jumbotron } from '@unic/core-ui';
import { currentUserLoggedAtom, openLoginAtom } from './app-header';
import { onLoginAtom } from './login-form';
import { useGetCorporaCount } from '../data-access/get-corpora-count.hook';
import { useStore } from '@nanostores/react';

export function HomePage() {
  const currentUserLogged = useStore(currentUserLoggedAtom);
  const { data: numberOfCorpus } = useGetCorporaCount();

  function redirectAfterLogin(url: string) {
    const urlToRedirect = url;
    if (currentUserLogged?.user_uuid) {
      window.location.href = urlToRedirect;
    } else {
      onLoginAtom.set(() => {
        window.location.href = urlToRedirect;
      });
      openLoginAtom.get()?.();
    }
  }

  return (
    <div className="flex-1 pb-11">
      <Jumbotron title="UNIC" description="A unified corpus for interpreting" />
      <div className="grid grid-cols-1 mx-auto gap-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <Card
            title="Explore UNIC"
            description={`Explore ${numberOfCorpus?.corpora_count ?? ''} interpreting corpora in one click`}
            button={{ label: 'Explore', href: '/explore' }}
          />
          <Card
            title="Register your corpus"
            description="Let the world know your corpus and find collaborators"
            button={{
              label: 'Register',
              onClick: () =>
                redirectAfterLogin('/corpora-metadata/register-your-corpus'),
            }}
          />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <Card
            title="Share your corpus"
            description="Improve transparency, accountability and reproducibility"
            button={{
              label: 'Share',
              onClick: () => redirectAfterLogin('/share'),
            }}
          />
          <Card
            title="Use shared data"
            description="Use shared corpora to answer new questions"
            button={{
              label: 'Use',
              onClick: () => redirectAfterLogin('/use'),
            }}
          />
        </div>
      </div>
    </div>
  );
}
