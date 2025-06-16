export const Footer = () => {
  return (
    <footer className="grid grid-cols-1 gap-4 py-8 bg-white">
      <div className="mx-auto max-w-screen-xl flex flex-col gap-4">
        <div className="flex justify-center items-center gap-4">
          <span className="text-sm font-bold text-gray-600">Contact us:</span>
          <a
            href="mailto:unic@dipintra.it"
            className="text-sm font-normal text-blue-800 hover:underline"
          >
            unic@dipintra.it
          </a>
        </div>
        <div className="flex justify-center items-center gap-4">
          <span className="text-xs font-normal text-gray-600 text-right">
            Marie Skłodowska-Curie grant agreement{' '}
            <a
              href="https://cordis.europa.eu/project/id/101108651"
              className="text-blue-800 hover:underline"
            >
              No. 101108651
            </a>{' '}
            - EU Horizon 2020 programme
            <br />
            Department of Interpreting and Translation - University of Bologna{' '}
          </span>
          <span className="bg-gray-600 w-px h-9" />
          <span className="text-xs font-normal text-gray-600 text-left">
            Each corpus on UNIC is owned by the party who contributed it.
            <br />
            Use of UNIC is subject to the{' '}
            <a
              href="/unic_terms_conditions.pdf"
              className="text-blue-800 hover:underline"
            >
              Terms and Conditions of Use
            </a>{' '}
            and the{' '}
            <a
              href="/unic_privacy_policy.pdf"
              className="text-blue-800 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
