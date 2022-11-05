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
import { Genders, SizeI18nKeys } from "../api/enums";

interface IProps {
  variant: "outlined" | "standard";
  showInputLabel: boolean;
  label: string;
  // gender enum
  genders: string[];
  sizes: string[];
  handleSelectedCategoriesChange: (selectedCategories: string[]) => void;
  style?: React.CSSProperties;
}

const SizesDropdown: React.FC<IProps> = ({
  variant,
  showInputLabel,
  label,
  genders,
  sizes,
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
        <InputLabel classes={{ root: classes.labelSelect }}>{label}</InputLabel>
      )}
      <Select
        multiple
        displayEmpty
        input={
          variant === "outlined" ? (
            <OutlinedInput
              classes={{
                root: classes.selectInputOutlined + " tw-h-12",
              }}
            />
          ) : (
            <Input
              classes={{
                root: classes.selectInputStandard + " tw-h-12",
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
        value={sizes}
        onChange={handleOnChange}
        renderValue={(selected: string[]) => {
          if (!selected.length) {
            return showInputLabel ? null : (
              <Typography
                component="span"
                classes={{ root: classes.emptyRenderValue }}
              >
                {label}
              </Typography>
            );
          } else {
            return selected.map((size) => t(SizeI18nKeys[size])).join(", ");
          }
        }}
      >
        <Typography component="p" className={classes.label}>
          {t("childrenSizes")}
        </Typography>
        {categories[Genders.children].map((size) => (
          <MenuItem
            key={size}
            value={size}
            disabled={!genders.includes(Genders.children) && !!genders.length}
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
          >
            <Checkbox color="secondary" checked={sizes.includes(size)} />
            <ListItemText
              primary={t(SizeI18nKeys[size])}
              classes={{
                primary: classes.listItemTextFontSize,
              }}
            />
          </MenuItem>
        ))}

        <Typography component="p" className={classes.label}>
          {t("womenSizes")}
        </Typography>
        {categories[Genders.women].map((size) => (
          <MenuItem
            key={size}
            value={size}
            disabled={!genders.includes(Genders.women) && !!genders.length}
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
          >
            <Checkbox color="secondary" checked={sizes.includes(size)} />
            <ListItemText
              primary={t(SizeI18nKeys[size])}
              classes={{
                primary: classes.listItemTextFontSize,
              }}
            />
          </MenuItem>
        ))}

        <Typography component="p" className={classes.label}>
          {t("menSizes")}
        </Typography>
        {categories[Genders.men].map((size) => (
          <MenuItem
            key={size}
            value={size}
            disabled={!genders.includes(Genders.men) && !!genders.length}
            classes={{
              root: classes.menuItemSpacingAndColor,
              selected: classes.selected,
            }}
          >
            <Checkbox color="secondary" checked={sizes.includes(size)} />
            <ListItemText
              primary={t(SizeI18nKeys[size])}
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

export default SizesDropdown;
