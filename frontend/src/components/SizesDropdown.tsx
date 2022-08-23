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

interface IProps {
	variant: "outlined" | "standard";
	showInputLabel: boolean;
	label: string;
	selectedGenders: string[];
	selectedSizes: string[];
	handleSelectedCategoriesChange: (selectedCategories: string[]) => void;
	style?: React.CSSProperties;
}

const SizesDropdown: React.FC<IProps> = ({
	variant,
	showInputLabel,
	label,
	selectedGenders,
	selectedSizes,
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
				value={selectedSizes}
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
						return selected.map(t).join(", ");
					}
				}}
			>
				<Typography component="p" className={classes.label}>
					{t("childrenSizes")}
				</Typography>
				{categories.children.map((value: string) => (
					<MenuItem
						key={value}
						value={value}
						disabled={
							!selectedGenders.includes("children") && !!selectedGenders.length
						}
						classes={{
							root: classes.menuItemSpacingAndColor,
							selected: classes.selected,
						}}
					>
						<Checkbox
							color="secondary"
							checked={selectedSizes.includes(value) ? true : false}
						/>
						<ListItemText
							primary={t(value)}
							classes={{
								primary: classes.listItemTextFontSize,
							}}
						/>
					</MenuItem>
				))}

				<Typography component="p" className={classes.label}>
					{t("womenSizes")}
				</Typography>
				{categories.women.map((value: string) => (
					<MenuItem
						key={value}
						value={value}
						disabled={
							!selectedGenders.includes("women") && !!selectedGenders.length
						}
						classes={{
							root: classes.menuItemSpacingAndColor,
							selected: classes.selected,
						}}
					>
						<Checkbox
							color="secondary"
							checked={selectedSizes.includes(value) ? true : false}
						/>
						<ListItemText
							primary={t(value)}
							classes={{
								primary: classes.listItemTextFontSize,
							}}
						/>
					</MenuItem>
				))}

				<Typography component="p" className={classes.label}>
					{t("menSizes")}
				</Typography>
				{categories.men.map((value: string) => (
					<MenuItem
						key={value}
						value={value}
						disabled={
							!selectedGenders.includes("men") && !!selectedGenders.length
						}
						classes={{
							root: classes.menuItemSpacingAndColor,
							selected: classes.selected,
						}}
					>
						<Checkbox
							color="secondary"
							checked={selectedSizes.includes(value) ? true : false}
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

export default SizesDropdown;
