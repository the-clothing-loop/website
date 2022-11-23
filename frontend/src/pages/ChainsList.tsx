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
        <div
          className={`tw-container tw-mx-auto ${
            chains ? "" : "tw-animate-pulse"
          }`}
        >
          <div className="tw-px-1 md:tw-px-20 tw-py-4">
            <h1 className="tw-text-2xl tw-font-bold tw-mb-3">{`${
              chains?.length || 0
            } Clothing Loops`}</h1>
            {chains ? (
              <DataExport chains={chains} />
            ) : (
              <button className="tw-btn tw-btn-outline tw-btn-primary" disabled>
                ...
              </button>
            )}
          </div>

          <div className="sm:tw-overflow-x-auto">
            <table className="tw-table tw-table-compact tw-w-full">
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
                        <td className="tw-font-bold tw-w-32 tw-whitespace-normal">
                          {chain.name}
                        </td>
                        <td align="left" className="tw-whitespace-normal">
                          {chain.address}
                        </td>
                        <td align="center">
                          {chain.published ? (
                            <div className="tw-tooltip" data-tip="published">
                              <span className="feather feather-eye  tw-text-lg tw-text-green" />
                            </div>
                          ) : (
                            <div className="tw-tooltip" data-tip="draft">
                              <span className="feather feather-eye-off  tw-text-lg tw-text-red" />
                            </div>
                          )}
                        </td>
                        <td align="right">
                          {(isUserAdmin || authUser?.is_root_admin) && (
                            <Link
                              className={`tw-btn tw-btn-primary tw-flex-nowrap ${
                                chains?.length > 5 ? "tw-btn-sm" : ""
                              }`}
                              to={`/loops/${chain.uid}/members`}
                            >
                              {t("view")}
                              <span className="feather feather-arrow-right tw-ml-3"></span>
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
