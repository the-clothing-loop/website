import { Helmet } from "react-helmet";

export default function TermsOfHosts() {
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Terms of Hosts</title>
        <meta name="description" content="Terms of use" />
      </Helmet>
      <div className="container mx-auto px-4 md:px-20 py-10">
        <h1 className="font-serif text-secondary font-bold text-5xl mb-4">
          {"Terms of Use - The Clothing Loop"}
        </h1>

        <div className="prose">
          <p>Version dated 2023, December 11th</p>

          <h2>Terms of Hosts</h2>

          <p>...</p>

          <h2>Contact details</h2>

          <p>Do you have any questions? Then contact us at:</p>
          <p>
            Email:{" "}
            <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
          </p>
          <p>Or by post:</p>
          <p>The Clothing Loop</p>
          <p>
            <address>
              P/A Stichting Slow Fashion Movement
              <br />
              Wethouder Frankeweg 22 H <br />
              1098 LA Amsterdam
              <br />
              The Netherlands
            </address>
          </p>
        </div>
      </div>
    </>
  );
}
