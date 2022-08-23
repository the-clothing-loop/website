//MUI
import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { Helmet } from "react-helmet";

//project resources
import theme from "../util/theme";

const PrivacyPolicy = () => {
	const classes = makeStyles(theme as any)();

	return (
		<>
			<Helmet>
				<title>The Clothing Loop | Privacy Policy</title>
				<meta name="description" content="privacy policy" />
			</Helmet>
			<div className={classes.legalPagesWrapper}>
				<Typography component="h1" className={classes.pageTitle}>
					{"Privacy Policy - The Clothing Loop"}
				</Typography>

				<Typography component="p">Version dated 2022, February 9th</Typography>
				<Typography component="p" className={classes.p}>
					The Clothing Loop is part of the foundation Slow Fashion Movement, KvK
					85110701
				</Typography>
				<Typography component="p" className={classes.p}>
					We see it as our responsibility to protect your privacy according to
					the guidelines of the AVG (Algemene Verordening Gegevensbescherming)
					that entered into force on May 25th 2018. This privacy policy will
					explain how our organization uses the personal data we collect from
					you when you use our website.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					Table of content
				</Typography>

				<Typography component="p" className={classes.p}>
					<ul style={{ listStyleType: "none" }}>
						<li> What data do we collect?</li>
						<li> How do we collect your data?</li>
						<li>How will we use your data?</li>
						<li> How do we store your data?</li>
						<li>
							Newsletter and communication What are your data protection rights?
						</li>
						<li> What are cookies?</li>
						<li>How do we use cookies? How to manage your cookies?</li>
						<li>
							Privacy policies of other websites Changes to our privacy policy
							How to contact us?
						</li>
						<li> How to contact the appropriate authorities</li>
					</ul>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					What data do we collect?
				</Typography>

				<Typography component="p" className={classes.p}>
					The Clothing Loop collects the following data:
					<ul>
						<li>
							personal identification information (first name, last name, email,
							address, phone number, gender, age, date of subscribing,
							allocation to specific local Clothing Loop);
						</li>
						<li>input from surveys and customer panel.</li>
					</ul>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How do we collect your data?
				</Typography>

				<Typography component="p" className={classes.p}>
					You directly provide The Clothing Loop with the data we collect. We
					collect data and process data when you:
					<ul>
						<li>
							register online or place an order for any of our products or
							services;
						</li>
						<li>
							voluntarily complete a customer survey or provide feedback on any
							of our message boards or via email;
						</li>
						<li>use or view our website via your browser's cookies.</li>
					</ul>
					The Clothing Loop may also receive your data indirectly from the
					following sources:
					<ul>
						<li>None.</li>
					</ul>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How will we use your data?
				</Typography>

				<Typography component="p" className={classes.p}>
					The Clothing Loop collects your data so that we can:
					<ul>
						<li>process your registration with the Clothing Loop;</li>
						<li>
							provide your data to your local host of the local Clothing Loop in
							order to onboard you. Depending on the local host that can be:
							adding to an app-group, adding in the Glide app;
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
							delivered to you by someone other than the people directly before
							or after you on the list, they can contact you to arrange drop off
							or pick up;
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
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How do we store your data?
				</Typography>

				<Typography component="p" className={classes.p}>
					Subscriber’s personal information (such as name, email, phone number,
					address) are stored by the Clothing Loop in Firebase database, which
					is a Google cloud service - more information about their privacy
					policy
					<a href="https://firebase.google.com/support/privacy" target="_blank">
						here
					</a>
				</Typography>
				<Typography component="p" className={classes.p}>
					The Clothing Loop will keep your personal data for a time-period as
					long as you are enrolled with the Clothing Loop. Once this time period
					has expired your data will be deleted by the Clothing Loop Admin team.
					The local host will delete your data from the glide-app, if used, or
					from any other tool or list for sharing your data with other local
					members of the Clothing Loop and you yourself can leave the relevant
					local app-groups, facebook groups etc.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					Newsletter and communication:
				</Typography>

				<Typography component="p" className={classes.p}>
					When subscribed, you will receive our newsletter. This newsletter will
					always be written and composed by us, with things relevant to the
					initiative. If branded and paid for content will be relevant in the
					future, we will always specify.
				</Typography>
				<Typography component="p" className={classes.p}>
					If you have agreed to receive our newsletter, you may always opt out
					at a later date. You can unsubscribe via the unsubscribe option at the
					bottom of the newsletter.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					What are your data protection rights?
				</Typography>

				<Typography component="p" className={classes.p}>
					The Clothing Loop would like to make sure you are fully aware of all
					of your data protection rights. Every user is entitled to the
					following:
				</Typography>
				<Typography component="p" className={classes.p}>
					<ol>
						<li>
							the right to access - You have the right to request The Clothing
							Loop for copies of your personal data;
						</li>
						<li>
							the right to correct your data: if your data changes, for example
							you move or your phone number changes, and this can for some
							reason not be changed within the local loop itself by the loop
							host, then ask for your data to be removed completely and sign
							back up;
						</li>
						<li>
							the right to erase - You have the right to request that The
							Clothing Loop erase your personal data;
						</li>
						<li>
							if you make a request, we have one month to respond to you. If you
							would like to exercise any of these rights, please contact us at
							our email:
							<a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
						</li>
					</ol>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					Special or sensitive personal data
				</Typography>

				<Typography component="p" className={classes.p}>
					Our website and/or services don’t have the intention to collect data
					of visitors of the website that are younger than 18 years of age
					unless they have permission from their parents or guardians. We are
					not capable of checking whether a visitor is older than 18 years of
					age. We advise parents to be involved with the online activities of
					their children, in order to prevent data collection without parental
					consent. In case you are convinced that we collected data without
					parental consent from a minor, please contact
					<a href="mailto:hello@clothingloop.org">hello@clothingloop.org </a>
					and we will erase the information.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					What are cookies?
				</Typography>

				<Typography component="p" className={classes.p}>
					Cookies are text files placed on your computer to collect standard
					Internet log information and visitor behaviour information. When you
					visit our websites, we may collect information from you automatically
					through cookies or similar technology.
				</Typography>
				<Typography component="p" className={classes.p}>
					For further information, visit
					<a href="https://www.allaboutcookies.org/" target="_blank">
						allaboutcookies.org.
					</a>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How do we use cookies?
				</Typography>

				<Typography component="p" className={classes.p}>
					The Clothing Loop uses cookies for:
					<ul>
						<li>
							User session management - this is strictly used for the local loop
							hosts when they login. We save information about their login in
							order to keep these hosts signed in.
						</li>
						<li>
							IP address tracking in order to retrieve the user location and use
							it to personalize the map view and the anonymised general map view
							and loops displayed.
						</li>
					</ul>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How to manage cookies
				</Typography>

				<Typography component="p" className={classes.p}>
					You can set your browser not to accept cookies, and the above website
					tells you how to remove cookies from your browser. However, in a few
					cases, some of our website features may not function as a result.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					Privacy policies of other websites
				</Typography>

				<Typography component="p" className={classes.p}>
					The Clothing Loop website contains links to other websites like the
					app we created for you in Glide. The use of this app is optional. Our
					privacy policy applies only to our website, so as soon as you leave
					<a href="www.clothingloop.org" target="_blank">
						www.clothingloop.org
					</a>
					to visit a third party website, their privacy policy applies
				</Typography>

				<Typography component="h3" className={classes.h3}>
					Changes to our privacy policy
				</Typography>

				<Typography component="p" className={classes.p}>
					The Clothing Loop keeps its privacy policy under regular review and
					places any updates on this web page. This privacy policy was last
					updated on 20th of January 2022.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How to contact us
				</Typography>

				<Typography component="p" className={classes.p}>
					If you have any questions about The Clothing Loop's privacy policy,
					the data we hold about you or you would like to exercise one of your
					data protection rights, please do not hesitate to contact us at
					<a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
				</Typography>

				<Typography component="h3" className={classes.h3}>
					How to contact the appropriate authority
				</Typography>

				<Typography component="p" className={classes.p}>
					Should you wish to report a complaint or if you feel that The Clothing
					Loop has not addressed your concern in a satisfactory manner, you may
					contact Autoriteit Persoonsgegevens in the Netherlands.
				</Typography>

				<Typography component="h3" className={classes.h3}>
					Contact details
				</Typography>

				<Typography component="p" className={classes.p}>
					Do you have any questions? Then contact us at: <br />
				</Typography>
				<Typography component="p" className={classes.p}>
					Email:{" "}
					<a href="mailto:hello@clothingloop.org">hello@clothingloop.org</a>
				</Typography>
				<Typography component="p" className={classes.p}>
					Or by post: <br />
					The Clothing Loop <br />
					P/A Stichting Slow Fashion Movement
					<br /> Wethouder Frankeweg 22 H <br />
					1098 LA Amsterdam <br />
					The Netherlands
				</Typography>
			</div>
		</>
	);
};

export default PrivacyPolicy;
