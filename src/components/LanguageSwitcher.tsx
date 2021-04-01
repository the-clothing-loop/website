import { useTranslation } from 'react-i18next';
import i18n from "../i18n";

// Material UI
import { AppBar, Toolbar, Button } from "@material-ui/core";

const LanguageSwitcher = () => {
    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    }

    return (
        <div>
            <button onClick={() => changeLanguage("en")}>EN</button>
            <button onClick={() => changeLanguage("nl")}>NL</button>
        </div>
    );
};

export default LanguageSwitcher
