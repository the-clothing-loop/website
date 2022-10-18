import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  FormControl,
  InputLabel,
  Select,
  Input,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import categories from "../util/categories";
import { GenderI18nKeys, Genders } from "../api/enums";

interface IProps {
  variant: "outlined" | "standard";
  showInputLabel: boolean;
  renderValueWhenEmpty?: string;
  genders: Array<Genders | string>;
  handleSelectedCategoriesChange: (genders: Array<Genders | string>) => void;
}

const CategoriesDropdown: React.FC<IProps> = ({
  variant,
  showInputLabel,
  renderValueWhenEmpty,
  genders: selectedGenders,
  handleSelectedCategoriesChange,
}: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const handleOnChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;

    handleSelectedCategoriesChange(
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <FormControl classes={{ root: classes.specificSpacing }} fullWidth>
      {showInputLabel && (
        <InputLabel classes={{ root: classes.labelSelect }}>
          {t("categories")}
        </InputLabel>
      )}
      <Select
        multiple
        displayEmpty
        input={
          variant === "outlined" ? (
            <OutlinedInput
              classes={{
                root: classes.selectInputOutlined,
              }}
            />
          ) : (
            <Input
              classes={{
                root: classes.selectInputStandard,
              }}
            />
          )
        }
        classes={{
          select:
            variant === "outlined"
              ? classes.selectOutlined
              : classes.selectStandard,
        }}
        variant={variant}
        value={selectedGenders}
        onChange={handleOnChange}
        renderValue={(selected: Array<string | Genders>) =>
          !selected.length && renderValueWhenEmpty ? (
            <Typography
              component="span"
              classes={{ root: classes.emptyRenderValue }}
            >
              {renderValueWhenEmpty}
            </Typography>
          ) : (
            selected.map((g) => t(GenderI18nKeys[g])).join(", ")
          )
        }
      >
        {Object.keys(categories).map((gender: string | Genders) => (
          <MenuItem
            key={gender}
            value={gender}
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
          >
            <Checkbox
              color="secondary"
              checked={selectedGenders.includes(gender)}
            />
            <ListItemText
              primary={t(GenderI18nKeys[gender])}
              classes={{
                primary: classes.listItemTextFontSize,
              }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default CategoriesDropdown;
