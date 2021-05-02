import ReactExport from "react-data-export";
import { useTranslation } from "react-i18next";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;


const ChainDataExport = (props) => {
    const { t } = useTranslation();

    const DataSet = [
        {
            columns: [
                {title: t("chainName")},
                {title: t("chainDescriptionviewChain")},
            ],
            data: Array.isArray(props.chainData) ? 
                props.chainData.map((chain)=> [
                    {value: chain.name},
                    {value: chain.description},
                ]) : null
        }
    ];

    return (
       <ExcelFile filename="chain-data" element={<button type="button">Export Chain Data</button>}>
           <ExcelSheet name="ChainName" dataSet={DataSet}></ExcelSheet>
       </ExcelFile>
    );
};

export default ChainDataExport;
