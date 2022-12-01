import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

import { DataExport } from "../components/DataExport";
import { AuthContext } from "../providers/AuthProvider";
import { chainGet, chainGetAll } from "../api/chain";
import { Chain } from "../api/types";
import { ToastContext } from "../providers/ToastProvider";
import { GinParseErrors } from "../util/gin-errors";

const ChainsList = () => {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const { addToastError } = useContext(ToastContext);
  const [chains, setChains] = useState<Chain[]>();

  useEffect(() => {
    (async () => {
      if (authUser) {
        try {
          let _chains: Chain[];
          if (authUser.is_root_admin) {
            _chains = (await chainGetAll({ filter_out_unpublished: false }))
              .data;
          } else {
            let data = await Promise.all(
              authUser.chains.map((c) => chainGet(c.chain_uid))
            );
            _chains = data.map((d) => d.data);
          }
          setChains(_chains.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (e: any) {
          console.error(e);
          addToastError(GinParseErrors(t, e?.data || "Unknown error"));
        }
      }
    })();
  }, [authUser]);

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Loops List</title>
        <meta name="description" content="Loops List" />z
      </Helmet>
      <main>
        <div className={`container mx-auto ${chains ? "" : "animate-pulse"}`}>
          <div className="px-4 md:px-20 py-4">
            <h1 className="text-2xl font-bold mb-3">{`${
              chains?.length || 0
            } Clothing Loops`}</h1>
            {chains ? (
              <DataExport chains={chains} />
            ) : (
              <button className="btn btn-outline btn-primary" disabled>
                ...
              </button>
            )}
          </div>

          <div className="sm:overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th align="left">{t("name")}</th>
                  <th align="left">{t("location")}</th>
                  <th align="center">{t("status")}</th>
                  <th align="right" />
                </tr>
              </thead>
              <tbody>
                {chains
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map((chain, i) => {
                    let isUserAdmin =
                      authUser?.chains.find((uc) => uc.chain_uid === chain.uid)
                        ?.is_chain_admin || false;
                    return (
                      <tr key={chain.name}>
                        <td className="font-bold w-32 whitespace-normal">
                          {chain.name}
                        </td>
                        <td align="left" className="whitespace-normal">
                          {chain.address}
                        </td>
                        <td align="center">
                          {chain.published ? (
                            <div className="tooltip" data-tip="published">
                              <span className="feather feather-eye  text-lg text-green" />
                            </div>
                          ) : (
                            <div className="tooltip" data-tip="draft">
                              <span className="feather feather-eye-off  text-lg text-red" />
                            </div>
                          )}
                        </td>
                        <td align="right">
                          {(isUserAdmin || authUser?.is_root_admin) && (
                            <Link
                              className={`btn btn-primary flex-nowrap ${
                                chains?.length > 5 ? "btn-sm" : ""
                              }`}
                              to={`/loops/${chain.uid}/members`}
                            >
                              {t("view")}
                              <span className="feather feather-arrow-right ml-3"></span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default ChainsList;
