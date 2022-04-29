import { useState } from "react";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableContainer,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/styles";

import { IUser } from "../types";

import theme from "../util/theme";

const useStyles = makeStyles(theme as any);

export const ChainParticipantsTable = ({
  columns,
  userData,
  users,
  initialPage,
  initialRowsPerPage,
  editItemComponent,
  deleteItemComponent,
}: {
  columns: { headerName: string; propertyName: string }[];
  userData: IUser | null;
  users: IUser[];
  initialPage: number;
  initialRowsPerPage: number;
  editItemComponent: any;
  deleteItemComponent: any;
}) => {
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

              {userData?.role === "admin" && (
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
              .map((u: IUser) => (
                <TableRow key={u.uid}>
                  {columns.map(({ propertyName }) => (
                    <BorderlessTableCell>
                      {propertyName === "interestedSizes"
                        ? u[propertyName].join(", ")
                        : u[propertyName]}
                    </BorderlessTableCell>
                  ))}

                  {userData?.role === "admin" && (
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
