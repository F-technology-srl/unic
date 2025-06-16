import { UserDto } from '@unic/shared/user-dto';
import { ButtonText } from '../button-text/button-text';
import { AngleDownIcon, UnicLogo } from '../icons';
import { Modal, ModalHandle } from '../modal/modal';
import { useEffect, useRef, useState } from 'react';
import Button from '../button/button';
import { useClickOutside } from '@unic/client-global-data-access';

export type UserHeader = UserDto & {
  avatar?: string | null;
};
export interface HeaderProps {
  user?: UserHeader;
  logout: () => void;
  loginForm: JSX.Element;
  registerForm: JSX.Element;
  loginRef: React.MutableRefObject<ModalHandle | null>;
  registerRef: React.MutableRefObject<ModalHandle | null>;
  isLoading?: boolean;
  initResetPasswordForm: JSX.Element;
  initialResetPasswordRef: React.MutableRefObject<ModalHandle | null>;
  hideHeaderButtons?: boolean;
}

export const Header = (props: HeaderProps) => {
  const [isLoading, setIsLoading] = useState(props.isLoading);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    setIsLoading(props.isLoading);
  }, [props.isLoading]);

  //in case of other dropdowns, create a component
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const toggleAboutDropdown = () => {
    setAboutDropdownOpen(!aboutDropdownOpen);
  };

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const aboutMenuRef = useRef<HTMLUListElement>(null);
  useClickOutside(aboutMenuRef, (ev) => {
    if (aboutDropdownOpen) {
      ev.preventDefault();
      ev.stopPropagation();
      setAboutDropdownOpen(false);
    }
  });

  const profileMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(profileMenuRef, (ev) => {
    if (profileDropdownOpen) {
      ev.preventDefault();
      ev.stopPropagation();
      setProfileDropdownOpen(false);
    }
  });

  if (isLoading) {
    return <div className="h-[60px] bg-white"></div>;
  }

  const isLinkActive = (path: string) => currentPath === path;

  return (
    <header>
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-6 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <a href="/" className="flex items-center">
            <UnicLogo />
          </a>
          {!props.hideHeaderButtons && (
            <div className={`flex justify-between items-center`}>
              <ul className="flex font-medium space-x-8">
                <li className="relative">
                  <button
                    id="about-menu-button"
                    // data-dropdown-toggle="about-menu"
                    className={`flex items-center justify-between w-full font-medium ${
                      isLinkActive('/funding') ||
                      isLinkActive('/publications') ||
                      isLinkActive('/our-team')
                        ? 'text-blue-600'
                        : 'text-gray-900 hover:text-blue-600'
                    } `}
                    onClick={toggleAboutDropdown}
                  >
                    About
                    <AngleDownIcon />
                  </button>
                  {aboutDropdownOpen && (
                    <div
                      id="about-menu"
                      className="absolute top-10 left-1/2 -translate-x-1/2 z-10 min-w-[224px]  flex flex-col w-auto text-sm font-normal bg-white border border-gray-100 rounded-lg shadow-md"
                    >
                      <div className="py-1 text-gray-900">
                        <ul
                          aria-labelledby="about-menu-button"
                          ref={aboutMenuRef}
                        >
                          <li className="py-2 px-4 hover:bg-gray-100 group">
                            <a
                              href="/funding"
                              className={`block w-full ${
                                isLinkActive('/funding')
                                  ? 'text-blue-800'
                                  : 'text-gray-500 group-hover:text-blue-800'
                              }`}
                            >
                              Funding
                            </a>
                          </li>
                          <li className="py-2 px-4 hover:bg-gray-100 group">
                            <a
                              href="/publications"
                              className={`block w-full ${
                                isLinkActive('/publications')
                                  ? 'text-blue-800'
                                  : 'text-gray-500 group-hover:text-blue-800'
                              }`}
                            >
                              Publications
                            </a>
                          </li>
                          <li className="py-2 px-4 hover:bg-gray-100 group">
                            <a
                              href="/our-team"
                              className={`block w-full ${
                                isLinkActive('/our-team')
                                  ? 'text-blue-800'
                                  : 'text-gray-500 group-hover:text-blue-800'
                              }`}
                            >
                              Our team
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
                <li>
                  <a
                    href="/explore"
                    className={`block ${
                      isLinkActive('/explore')
                        ? 'text-blue-600'
                        : 'text-gray-900 hover:text-blue-600'
                    } `}
                  >
                    Explore
                  </a>
                </li>
                {props.user && (
                  <>
                    <li>
                      <a
                        href="/corpora-metadata/register-your-corpus"
                        className={`block ${
                          isLinkActive('/corpora-metadata/register-your-corpus')
                            ? 'text-blue-600'
                            : 'text-gray-900 hover:text-blue-600'
                        }`}
                      >
                        Register
                      </a>
                    </li>
                    <li>
                      <a
                        href="/share"
                        className={`block ${
                          isLinkActive('/share')
                            ? 'text-blue-600'
                            : 'text-gray-900 hover:text-blue-600'
                        }`}
                      >
                        Share
                      </a>
                    </li>
                    <li>
                      <a
                        href="/use"
                        className={`block ${
                          isLinkActive('/use')
                            ? 'text-blue-600'
                            : 'text-gray-900 hover:text-blue-600'
                        }`}
                      >
                        Use
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
          {!props.hideHeaderButtons && (
            <div className={`flex items-center`}>
              {!props.user ? (
                <>
                  <Modal
                    ref={props.loginRef}
                    id="login"
                    disableOutsideClick={true}
                    triggerElement={
                      <span className="text-sm font-medium text-blue-800 cursor-pointer mr-4">
                        Log in
                      </span>
                    }
                  >
                    {props.loginForm}
                  </Modal>
                  <Modal
                    ref={props.registerRef}
                    id="register"
                    disableOutsideClick={true}
                    triggerElement={
                      <Button type="primary" size="regular">
                        Sign up
                      </Button>
                    }
                  >
                    {props.registerForm}
                  </Modal>
                </>
              ) : (
                <div className="relative flex items-center gap-4">
                  {props.user.avatar ? (
                    <img
                      className="relative w-10 h-10 rounded-full cursor-pointer"
                      src={props.user.avatar}
                      alt={`${props.user.first_name} avatar`}
                      id="user-menu-button"
                      // data-dropdown-toggle="user-menu"
                      onClick={toggleProfileDropdown}
                    />
                  ) : (
                    <div
                      className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full cursor-pointer"
                      id="user-menu-button"
                      // data-dropdown-toggle="user-menu"
                      onClick={toggleProfileDropdown}
                    >
                      <span className="font-medium text-gray-900">
                        {(props?.user?.first_name || '')[0] +
                          (props?.user?.last_name || '')[0]}
                      </span>
                    </div>
                  )}
                  {profileDropdownOpen && (
                    <div
                      id="user-menu"
                      className="absolute p-4 top-14 right-0 z-10 min-w-[224px] flex flex-col w-auto text-sm font-normal bg-white border border-gray-100 rounded-lg shadow-md"
                      ref={profileMenuRef}
                    >
                      <span className="font-semibold text-gray-900">
                        {(props.user.first_name ?? '') +
                          ' ' +
                          (props.user.last_name ?? '')}
                      </span>
                      <span className="font-normal text-gray-500">
                        {props.user.email}
                      </span>
                    </div>
                  )}
                  <span className="h-8 w-px bg-gray-200" />
                  <ButtonText onClick={props.logout}>Log out</ButtonText>
                </div>
              )}
            </div>
          )}
        </div>
        <Modal
          ref={props.initialResetPasswordRef}
          id="init-reset-password"
          disableOutsideClick={true}
          triggerElement={<span></span>}
        >
          {props.initResetPasswordForm}
        </Modal>
      </nav>
    </header>
  );
};

export default Header;
