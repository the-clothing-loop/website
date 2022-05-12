import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  InputLabel,
  Checkbox,
  ListItemText,
  Select,
  Input,
  OutlinedInput,
  FormControl,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import categories from "../util/categories";

interface IProps {
  variant: "outlined" | "standard";
  showInputLabel: boolean;
  renderValueWhenEmpty?: string;
  selectedCategories: string[];
  handleSelectedCategoriesChange: (selectedCategories: string[]) => void;
}

const CategoriesDropdown: React.FC<IProps> = ({
  variant,
  showInputLabel,
  renderValueWhenEmpty,
  selectedCategories,
  handleSelectedCategoriesChange,
}: IProps) => {
  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const handleOnChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

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
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        displayEmpty
        input={
          variant === "outlined" ? (
            <OutlinedInput
              classes={{
                root: classes.select,
              }}
            />
          ) : (
            <Input
              classes={{
                root: classes.formSelect,
              }}
            />
          )
        }
        variant={variant}
        value={selectedCategories}
        onChange={handleOnChange}
        renderValue={(selected: string[]) =>
          !selected.length && renderValueWhenEmpty ? (
            <Typography
              component="span"
              classes={{ root: classes.emptyRenderValue }}
            >
              {renderValueWhenEmpty}
            </Typography>
          ) : (
            selected.map(t).join(", ")
          )
        }
      >
        {Object.keys(categories).map((value: string) => (
          <MenuItem
            key={value}
            value={value}
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
          >
            <Checkbox
              color="secondary"
              checked={selectedCategories.includes(value) ? true : false}
            />
            <ListItemText
              primary={t(value)}
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
