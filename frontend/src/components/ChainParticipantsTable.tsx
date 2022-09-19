import { useState } from "react";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableContainer,
} from "@mui/material";

import { makeStyles } from "@mui/styles";

import theme from "../util/theme";
import { User } from "../api/types";
import { SizeI18nKeys, Sizes } from "../api/enums";

const useStyles = makeStyles(theme as any);

export interface TableUserColumn {
  headerName: string;
  propertyName: keyof User;
}

interface Props {
  columns: TableUserColumn[];
  authUser: User | null;
  users: User[];
  initialPage: number;
  initialRowsPerPage: number;
  editItemComponent: any;
  deleteItemComponent: any;
}

export const ChainParticipantsTable = ({
  columns,
  authUser,
  users,
  initialPage,
  initialRowsPerPage,
  editItemComponent,
  deleteItemComponent,
}: Props) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = (e: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  return (
    <>
      <TableContainer className="chain-member-list__table--margin">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(({ headerName }) => {
                return (
                  <HeadRowTableCell key={headerName}>
                    {headerName}
                  </HeadRowTableCell>
                );
              })}

              {authUser?.is_admin && (
                <>
                  {editItemComponent && <HeadRowTableCell />}
                  {deleteItemComponent && <HeadRowTableCell />}
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((u: User) => (
                <TableRow key={u.uid}>
                  {columns.map(({ propertyName }) => {
                    let text = propertyName as string;
                    if (propertyName === "sizes") {
                      text = u.sizes
                        .filter((v) => Object.hasOwn(SizeI18nKeys, v))
                        .map((v) => SizeI18nKeys[v])
                        .join(", ");
                    }
                    return <BorderlessTableCell>{text}</BorderlessTableCell>;
                  })}

                  {authUser?.is_admin && (
                    <>
                      {editItemComponent && (
                        <BorderlessTableCell>
                          {editItemComponent(u)}
                        </BorderlessTableCell>
                      )}
                      {deleteItemComponent && (
                        <BorderlessTableCell>
                          {deleteItemComponent(u)}
                        </BorderlessTableCell>
                      )}
                    </>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          nextIconButtonProps={{ size: "large" }}
          backIconButtonProps={{ size: "large" }}
        />
      </TableContainer>
    </>
  );
};

const BorderlessTableCell = ({ children, ...props }: { children: any }) => {
  const classes = useStyles();

  return (
    <TableCell classes={{ root: classes.borderlessTableCellRoot }} {...props}>
      {children}
    </TableCell>
  );
};

const HeadRowTableCell = ({ children, ...props }: { children?: any }) => {
  const classes = useStyles();

  return (
    <TableCell
      classes={{ root: classes.headRowTableCellRoot }}
      variant="head"
      {...props}
    >
      {children}
    </TableCell>
  );
};
