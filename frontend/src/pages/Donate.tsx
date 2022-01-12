// Material
import {makeStyles} from "@material-ui/core";
import DonationForm from "../components/Donation/DonationForm";

//Project resources
import theme from "../util/theme";
import {RouteComponentProps} from "react-router";

type TParams = {
    status?: string;
}

const Donate = ({match}: RouteComponentProps<TParams>) => {
    const classes = makeStyles(theme as any)();
    const params = match.params;
    const {status} = params;


    return (
        <>

            <div className={classes.pageGrid} style={{justifyContent: "flex-start"}}>


                  <div>
                      <h3>Donation test page</h3>


                      {status === "thankyou" ?
                          <>Thank you</> :
                          <DonationForm/>
                      }


                  </div>


            </div>
        </>
    );
};

export default Donate;
