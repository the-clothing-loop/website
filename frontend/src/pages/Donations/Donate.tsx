import { RouteComponentProps } from "react-router";
import { Helmet } from "react-helmet";
import DonationForm from "./DonationForm";
import DonationCompleted from "./DonationCompleted";

type TParams = {
  status?: string;
};

export default function Donate({ match }: RouteComponentProps<TParams>) {
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Donate</title>
        <meta name="description" content="Donate" />
      </Helmet>
      <div>
        {match.params.status === "thankyou" ? (
          <DonationCompleted />
        ) : (
          <DonationForm />
        )}
      </div>
    </>
  );
}
