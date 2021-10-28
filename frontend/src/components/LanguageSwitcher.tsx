import i18n from "../i18n";
import { useState } from "react";

//material UI
import Button from "@material-ui/core/Button";

const LanguageSwitcher = () => {
  const languages = ["en", "nl"];

  const [selected, setSelected] = useState("en");

  const handleClick = (language: string) => {
    i18n.changeLanguage(language);
    setSelected(language);
  };

  return (
    <div className="language-switcher-wrapper">
      {languages
        ? languages.map((el, i) => {
            return (
              <Button
                name={el}
                color="secondary"
                variant={selected === el ? "contained" : "outlined"}
                onClick={() => handleClick(el)}
                key={i}
              >
                {el}
              </Button>
            );
          })
        : null}
    </div>
  );
};

export default LanguageSwitcher;
