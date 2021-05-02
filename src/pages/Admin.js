import { useEffect, useState } from "react";

// Project resources
import { getChains } from "../util/firebase/chain";
import ChainDataExport from "../components/ChainDataExport";

const Admin = () => {

    const [chainData, setChainData] = useState([]);

    useEffect(() => {
        getChains().then((response) => {
          setChainData(response);
        });
        
      }, []);

    return (
        <div>
            <h1>Hello there Admin!</h1>
            <ChainDataExport chainData={chainData} />
        </div>
    );
};

export default Admin;