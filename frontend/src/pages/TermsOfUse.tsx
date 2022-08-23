//MUI
import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { Helmet } from "react-helmet";

//project resources
import theme from "../util/theme";

const TermsOfUse = () => {
  const classes = makeStyles(theme as any)();

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Terms of Use</title>
        <meta name="description" content="Terms of use" />
      </Helmet>
      <div className={classes.legalPagesWrapper}>
        <Typography component="h1" className={classes.pageTitle}>
          {"Terms of Use - The Clothing Loop"}
        </Typography>

        <Typography component="p">Version dated 2022, January 29th</Typography>

        <Typography component="h3" className={classes.h3}>
          Terms of Use
        </Typography>

        <Typography component="p">
          <ol>
            <li>
              These terms of use, as amended from time to time (hereinafter
              referred to as the <span>"Terms of Use"</span>), stipulate (a) the
              terms under which use may be made of the website,
              www.clothingloop.org and the application (together and separately
              hereinafter also referred to as the <span>"Platform"</span>) of
              and offered by The Clothing Loop (hereinafter referred to as “The
              Clothing Loop" or <span>"we"</span> or <span>"us"</span>) as part
              of Stichting Slow Fashion Movement, (KVK 85110701) and (b) the
              terms of your participation in The Clothing Loop.
            </li>
            <li>
              By using the Platform, you (hereinafter also referred to as the
              <span>"User"</span>) confirm that you are of legal age in your
              jurisdiction of residence to enter into a binding agreement.
            </li>
          </ol>
        </Typography>

        <Typography component="h3" className={classes.h3}>
          Applicability and amendments
        </Typography>
        <Typography component="p">
          <ol start={3}>
            <li>
              By using the Platform and thus participating in The Clothing Loop,
              you agree to the Terms of Use, and the Terms of Use shall apply to
              your use of the Platform and participation in The Clothing Loop.
            </li>
            <li>
              We reserve the right to unilaterally amend these Terms of Use. We
              will endeavour to inform you of any (material) changes to the
              Terms of Use in a timely manner. In addition, we may at any time
              modify the Platform, change and/or delete data or restrict or
              discontinue the use of the Platform or your participation in The
              Clothing Loop, without any liability on any grounds whatsoever
              towards you or other third parties and without you being able to
              derive any rights therefrom.
            </li>
          </ol>
        </Typography>

        <Typography component="h3" className={classes.h3}>
          Use of the Platform and general rules of conduct
        </Typography>
        <Typography component="p">
          <ol start={5}>
            <li>
              The goal of The Clothing Loop is to make it easy and fun to share
              pre-loved clothes by connecting people in local communities that
              share a bag of clothes - free of charge. The Platform,
              www.clothingloop.org, is solely intended to give Users the
              opportunity to participate in The Clothing Loop. After you have
              successfully registered, you will be connected to a local Loop
              near your residence to actively start participating. We note that
              the participants/users of a local Loop are responsible for the
              implementation and monitoring of the concept of The Clothing Loop
              – you and your community must do it together! Although The
              Clothing Loop is happy to assist with tips and tricks, it has no
              responsibility and liability in respect hereto. We are only here
              to facilitate by providing the Platform, the rest is up to you!
            </li>
            <li>
              It is not allowed to use the Platform for purposes other than the
              purpose stipulated above, such as (but not only) commercial
              purposes, unless The Clothing Loop has provided its prior written
              consent thereto. It is also not permitted to offer goods or
              services in exchange for any person’s participation in the
              Clothing Loop (including yours), nor is it permitted to charge
              others for their participation in The Clothing Loop or for any
              items that are exchanged as part of The Clothing Loop.
            </li>
            <li>
              You are responsible for and are required to use the Platform
              carefully and to conduct yourself in a way that aligns with the
              purpose and values of The Clothing Loop. You are also required to
              follow any instructions and regulations issued by The Clothing
              Loop as applicable. The foregoing includes (among other things)
              that you:
              <br />
              <br />
              <ul>
                <li>must provide complete and truthful information;</li>
                <li>may not share misleading or offensive information;</li>
                <li>
                  may not violate the rights of ownership and/or other personal
                  rights of other Users or third parties (including intellectual
                  property rights);
                </li>
                <li>
                  may not perform or permit any acts and/or conduct that
                  violates applicable laws or regulations, public morals, public
                  order or the rights of other Users or third parties (including
                  the rights of The Clothing Loop);
                </li>
                <li>
                  must conduct yourself in a respectful and cordial manner in
                  all communications with other Users and you must adhere to the
                  rules and regulations applicable to any channels used by the
                  local Clothing Loops;
                </li>
                <li>
                  may not add to the Platform (or via any other channels used by
                  a local Loop) any texts, data or files that have illegal or
                  offensive content, for example, discriminatory, racist, sexist
                  or pornographic content, or (otherwise) infringe on the
                  private lives of other Users or third parties;
                </li>
                <li>must keep your own login data confidential;</li>
                <li>
                  must keep the personal data of other Users or third parties
                  that may become available to you strictly confidential and, if
                  requested do to so, immediately destroy such personal data;
                </li>
                <li>
                  insofar as you share (personal) data of other Users or third
                  parties with us (for example, names, telephone numbers and
                  email addresses), you guarantee that you are authorized to
                  share this data with us in accordance with applicable laws and
                  regulations (for example, because you have permission to do
                  so) and that we can use this data for the purposes for which
                  this data has been shared with us;
                </li>
                <li>
                  may not spread viruses through the Platform (or through any
                  other channels used by the Clothing Loop), or otherwise
                  disrupt, prevent or damage (the operation of) the Platform;
                </li>
                <li>
                  must respect and consider the good name and reputation of The
                  Clothing Loop;
                </li>
                <li>
                  must install the application correctly and install updates to
                  the application;
                </li>
                <li>
                  may not sell or rent (the software behind) the Platform to
                  third parties or otherwise make it available to third parties;
                </li>
                <li>
                  may not de-compile, reverse engineer or modify the Platform
                  without The Clothing Loop’s prior consent. You may also not
                  remove or allow to be removed or circumvent any technical
                  measures intended to protect the Platform.
                </li>
              </ul>
            </li>
            <li>
              In terms of items (to be) shared as part of the Clothing Loop,
              you:
              <ul>
                <li>
                  represent and warrant that you are the owner of such items;
                </li>
                <li>
                  ensure that any items provided are clean, ready to wear and in
                  good shape (not discolored or damaged);
                </li>
                <li>
                  acknowledge and agree that you may not reclaim any items you
                  previously provided;
                </li>
                <li>
                  acknowledge and agree that The Clothing Loop (nor any other
                  Users) are responsible or liable for any lost items.
                </li>
              </ul>
            </li>
            <li>
              In the event of (suspected) use of the Platform or conduct in
              violation of these Terms of Use or contrary to the purpose and
              values of The Clothing Loop, we may take any action we deem
              necessary and appropriate, including (but not limited to) denying
              access to the Platform, removing you from a local Loop, or
              prohibit you from participating in The Clothing Loop, in whole or
              in part, temporarily or permanently, and recover any damages
              and/or costs from you. We may also inform the competent
              institutions and authorities.
            </li>
          </ol>
        </Typography>
        <Typography component="h3" className={classes.h3}>
          Links to other websites and/or applications
        </Typography>
        <Typography component="p">
          <ol start={10}>
            <li>
              It is possible that the Platform refers to external internet pages
              and/or applications, or vice versa. The Clothing Loop is not
              responsible or liable for the use of or the content of these
              external internet pages and/or applications.
            </li>
          </ol>
        </Typography>

        <Typography component="h3" className={classes.h3}>
          Liability
        </Typography>
        <Typography component="p">
          <ol start={11}>
            <li>
              The use of the Platform, and thus participating in The Clothing
              Loop is at your own risk and (if applicable) expense.
            </li>
            <li>
              We cannot exclude and do not guarantee that the Platform does not
              or cannot have any defects. Interruptions, errors, viruses,
              malware or other defects may occur. In addition, the information
              on the Platform may not be accurate, complete or up to date. The
              Clothing Loop is not responsible of liable for these defects.
            </li>
            <li>
              The Clothing Loop, shall not be liable for any damage or injury,
              physical or otherwise (including as a result of viruses, bacteria,
              resulting from the use of the Platform or participating in The
              Clothing Loop, unless direct damages are the result of
              demonstrable intent or gross negligence on the part of The
              Clothing Loop.
            </li>
            <li>
              The foregoing also means that The Clothing Loop is under no
              circumstances liable for indirect or consequential damages, such
              as loss of sales or income. You indemnify us against all possible
              third-party claims resulting from the use of the Platform or
              participation in The Clothing Loop.
            </li>
          </ol>
        </Typography>
        <Typography component="h3" className={classes.h3}>
          Intellectual property rights
        </Typography>
        <Typography component="p">
          <ol start={15}>
            <li>
              Unless otherwise stated, all intellectual property rights and/or
              similar rights in or to the Platform belong exclusively to The
              Clothing Loop or our licensors. This includes (among other things)
              the underlying software, texts, images, videos and audio clips.
              You may make copies of the information and images on the Platform
              exclusively for your own use, for example by printing or storing
              them. The commercial use of information and images of the Platform
              is expressly prohibited.
            </li>
            <li>
              The ownership of the texts, data and files placed by you on the
              Platform remains yours. However, you agree that we can use and
              distribute these texts, data and files without restriction for any
              purpose, without acknowledgement and without owing you any
              compensation, and insofar legally permitted. To the extent
              necessary, you hereby grant us a free, royalty-free, perpetual,
              irrevocable, worldwide, non-exclusive, and fully transferable and
              sub-licensable right and license to use, reproduce, display,
              distribute, adapt and modify all texts, data and files posted by
              you, create derivative works from them and otherwise exploit them
              in any way, commercially or non-commercially.
            </li>
          </ol>
        </Typography>
        <Typography component="h3" className={classes.h3}>
          Privacy and Cookie Policy
        </Typography>
        <Typography component="p">
          <ol start={17}>
            <li>
              Please be referred to our{" "}
              <a href="/privacy-policy">Privacy & Cookie policy</a>, which also
              applies when using the Platform.
            </li>
          </ol>
        </Typography>
        <Typography component="h3" className={classes.h3}>
          Choice of law and other provisions
        </Typography>
        <Typography component="p">
          <ol start={18}>
            <li>
              If these Terms of Use are or become partially invalid, you (and
              The Clothing Loop) will continue to be bound by the remaining,
              applicable provisions.
            </li>
            <li>
              The English version of these Terms of Use is binding. Translations
              are provided for convenience only.
            </li>
            <li>
              These Terms of Use shall be governed, to the extent possible, by
              Dutch law. The applicability of the Vienna Convention on Contracts
              for the International Sale of Goods is excluded. In the event of
              any dispute relating to these Terms of Use (including the
              applicability of these Terms of Use), we will try to resolve such
              dispute together. If that is not possible, the competent court in
              Amsterdam will have exclusive jurisdiction to settle the dispute,
              to the extent legally permissible.
            </li>
          </ol>
        </Typography>
        <Typography component="h3" className={classes.h3}>
          Contact details
        </Typography>

        <Typography component="p" className={classes.p}>
          Do you have any questions? Then contact us at:
        </Typography>
        <Typography component="p" className={classes.p}>
          Email:
          <a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
        </Typography>
        <Typography component="p" className={classes.p}>
          Or by post:
        </Typography>
        <Typography component="p" className={classes.p}>
          The Clothing Loop
        </Typography>
        <Typography component="p" className={classes.p}>
          P/A Stichting Slow Fashion Movement
          <br />
          Wethouder Frankeweg 22 H <br />
          1098 LA Amsterdam
          <br />
          The Netherlands
        </Typography>
      </div>
    </>
  );
};

export default TermsOfUse;
