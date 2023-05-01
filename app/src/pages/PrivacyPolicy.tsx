import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonText,
  IonPage,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton>{t("back")}</IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h1 style={{ marginTop: 0, fontSize: 30, fontWeight: "bold" }}>
            Privacy Policy
          </h1>

          <p>Version dated 2022, February 9th</p>
          <p>
            The Clothing Loop is part of the foundation Slow Fashion Movement,
            KvK 85110701
          </p>
          <p>
            We see it as our responsibility to protect your privacy according to
            the guidelines of the AVG (Algemene Verordening Gegevensbescherming)
            that entered into force on May 25th 2018. This privacy policy will
            explain how our organization uses the personal data we collect from
            you when you use our website.
          </p>

          <h2>Table of content</h2>

          <ul>
            <li>What data do we collect?</li>
            <li>How do we collect your data?</li>
            <li>How will we use your data?</li>
            <li>How do we store your data?</li>
            <li>
              Newsletter and communication What are your data protection rights?
            </li>
            <li> What are cookies?</li>
            <li>How do we use cookies? How to manage your cookies?</li>
            <li>
              Privacy policies of other websites Changes to our privacy policy
              How to contact us?
            </li>
            <li>How to contact the appropriate authorities</li>
          </ul>

          <h2>What data do we collect?</h2>

          <p>
            The Clothing Loop collects the following data:
            <ul>
              <li>
                personal identification information (first name, last name,
                email, address, phone number, gender, age, date of subscribing,
                allocation to specific local Clothing Loop);
              </li>
              <li>input from surveys and customer panel.</li>
            </ul>
          </p>

          <h3>GoatCounter</h3>
          <p>
            This website uses GoatCounter to measure the number of visitors to
            this website, what pages were visited, and the number of successful
            "screens."
            <br />
            <br />
            The following attributes are collected by GoatCounter:
            <ul>
              <li>Page URL (and parameters)</li>
              <li>Referer header</li>
              <li>User-Agent header</li>
              <li>Screen size</li>
              <li>Country name based on IP address</li>
              <li>A hash of the IP address, User-Agent, and random number</li>
            </ul>
            Please see the GoatCounter{" "}
            <a
              href="https://www.goatcounter.com/help/privacy"
              target="_blank"
              rel="noreferrer"
            >
              privacy policy
            </a>{" "}
            for more details
          </p>

          <h2>How do we collect your data?</h2>

          <p>
            You directly provide The Clothing Loop with the data we collect. We
            collect data and process data when you:
            <ul>
              <li>
                register online or place an order for any of our products or
                services;
              </li>
              <li>
                voluntarily complete a customer survey or provide feedback on
                any of our message boards or via email;
              </li>
              <li>use or view our website via your browser's cookies.</li>
            </ul>
            The Clothing Loop may also receive your data indirectly from the
            following sources:
            <ul>
              <li>None.</li>
            </ul>
          </p>

          <h2>How will we use your data?</h2>

          <p>
            The Clothing Loop collects your data so that we can:
            <ul>
              <li>process your registration with the Clothing Loop;</li>
              <li>
                provide your data to your local host of the local Clothing Loop
                in order to onboard you. Depending on the local host that can
                be: adding to an app-group, adding in the Glide app;
              </li>
              <li>
                within your local Clothing Loop group, when using the Glide-app,
                your address is only visible to the participants directly before
                and after you on the route;
              </li>
              <li>if new people are added to the route this may change;</li>
              <li>
                your (first) name and phone number will be visible to all
                participants of your local loop. In case you need to get a bag
                delivered to you by someone other than the people directly
                before or after you on the list, they can contact you to arrange
                drop off or pick up;
              </li>
              <li>contact you if necessary;</li>
              <li>improve processes and maximize impact;</li>
              <li>process your order;</li>
              <li>manage your account;</li>
              <li>email you with a newsletter (when you signed up for it);</li>
              <li>
                anonymised location data to show generic area of existing local
                Clothing Loops;
              </li>
            </ul>
          </p>

          <h2>How do we store your data?</h2>

          <p>
            Subscriber’s personal information (such as name, email, phone
            number, address) are stored by the Clothing Loop on a European based
            server that falls under European Law. More information about their
            privacy policy{" "}
            <a
              href="https://webdock.io/en/docs/legal/privacy-policy"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .
          </p>
          <p>
            The Clothing Loop will keep your personal data for a time-period as
            long as you are enrolled with the Clothing Loop. Once this time
            period has expired your data will be deleted by the Clothing Loop
            Admin team. The local host will delete your data from the Glide-app,
            if used, or from any other tool or list for sharing your data with
            other local members of the Clothing Loop and you yourself can leave
            the relevant local app-group, Facebook group etc.
          </p>

          <h2>Newsletter and communication:</h2>

          <p>
            When subscribed, you will receive our newsletter. This newsletter
            will always be written and composed by us, with things relevant to
            the initiative. If branded and paid for content will be relevant in
            the future, we will always specify.
          </p>
          <p>
            If you have agreed to receive our newsletter, you may always opt out
            at a later date. You can unsubscribe via the unsubscribe option at
            the bottom of the newsletter. If you are a Loop Host, you will
            automatically receive our email updates as they contain relevant
            information for hosting a Loop.
          </p>

          <h2>What are your data protection rights?</h2>

          <p>
            The Clothing Loop would like to make sure you are fully aware of all
            of your data protection rights. Every user is entitled to the
            following:
          </p>
          <p>
            <ol>
              <li>
                the right to access - You have the right to request The Clothing
                Loop for copies of your personal data;
              </li>
              <li>
                the right to correct your data: if your data changes, for
                example you move or your phone number changes, and this can for
                some reason not be changed within the local loop itself by the
                loop host, then ask for your data to be removed completely and
                sign back up;
              </li>
              <li>
                the right to erase - You have the right to request that The
                Clothing Loop erase your personal data;
              </li>
              <li>
                if you make a request, we have one month to respond to you. If
                you would like to exercise any of these rights, please contact
                us at our email:{" "}
                <a href="mailto:hello@clothingloop.org">
                  hello@clothingloop.org
                </a>
              </li>
            </ol>
          </p>

          <h2>Special or sensitive personal data</h2>

          <p>
            Our website and/or services don’t have the intention to collect data
            of visitors of the website that are younger than 18 years of age
            unless they have permission from their parents or guardians. We are
            not capable of checking whether a visitor is older than 18 years of
            age. We advise parents to be involved with the online activities of
            their children, in order to prevent data collection without parental
            consent. In case you are convinced that we collected data without
            parental consent from a minor, please contact{" "}
            <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>{" "}
            and we will erase the information.
          </p>

          <h2>What are cookies?</h2>

          <p>
            Cookies are text files placed on your computer to collect standard
            Internet log information and visitor behaviour information. When you
            visit our websites, we may collect information from you
            automatically through cookies or similar technology.
          </p>
          <p>
            For further information, visit{" "}
            <a
              href="https://www.allaboutcookies.org/"
              rel="noreferrer"
              target="_blank"
            >
              allaboutcookies.org.
            </a>
          </p>

          <h2>How do we use cookies?</h2>

          <p>
            The Clothing Loop uses cookies for:
            <ul>
              <li>
                User session management - this is strictly used for the local
                loop hosts when they login. We save information about their
                login in order to keep these hosts signed in.
              </li>
              <li>
                IP address tracking in order to retrieve the user location and
                use it to personalize the map view and the anonymised general
                map view and loops displayed.
              </li>
            </ul>
          </p>

          <h2>How to manage cookies</h2>

          <p>
            You can set your browser not to accept cookies, and the above
            website tells you how to remove cookies from your browser. However,
            in a few cases, some of our website features may not function as a
            result.
          </p>

          <h2>Privacy policies of other websites</h2>

          <p>
            The Clothing Loop website contains links to other websites like the
            app we created for you in Glide. The use of this app is optional.
            Our privacy policy applies only to our website, so as soon as you
            leave{" "}
            <a href="www.clothingloop.org" rel="noreferrer" target="_blank">
              www.clothingloop.org
            </a>{" "}
            to visit a third party website, their privacy policy applies
          </p>

          <h2>Changes to our privacy policy</h2>

          <p>
            The Clothing Loop keeps its privacy policy under regular review and
            places any updates on this web page. This privacy policy was last
            updated on 20th of January 2022.
          </p>

          <h2>How to contact us</h2>

          <p>
            If you have any questions about The Clothing Loop's privacy policy,
            the data we hold about you or you would like to exercise one of your
            data protection rights, please do not hesitate to contact us at{" "}
            <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
          </p>

          <h2>How to contact the appropriate authority</h2>

          <p>
            Should you wish to report a complaint or if you feel that The
            Clothing Loop has not addressed your concern in a satisfactory
            manner, you may contact Autoriteit Persoonsgegevens in the
            Netherlands.
          </p>

          <h2>Contact details</h2>

          <p>
            Do you have any questions? Then contact us at: <br />
          </p>
          <p>
            Email:{" "}
            <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
          </p>
          <p>
            Or by post: <br />
            <address>
              The Clothing Loop <br />
              P/A Stichting Slow Fashion Movement
              <br /> Wethouder Frankeweg 22 H <br />
              1098 LA Amsterdam <br />
              The Netherlands
            </address>
          </p>
        </IonText>
      </IonContent>
    </IonPage>
  );
}
