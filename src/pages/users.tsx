import React, { Component } from "react";
import db from "../util/firebase";
import { IUser } from "../types";

// Material UI
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

interface IUsersTableState {
  users: IUser[] | null;
}

interface IUserProps {
  user: IUser;
}

function Users() {
  return(
    <div>
      <h1>Users</h1>
      <UsersTable />
    </div>
  );
}

class UsersTable extends Component<{}, IUsersTableState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      users: null
    };
  }

  componentDidMount() {
    db.collection("users")
      .get()
      .then((snapshot) => {
        const users = snapshot.docs.map((x: any) => x.data() as IUser);
        this.setState({
          users,
        });
      })
      .catch((error) => {
        console.error("Error getting users: ", error);
      });
  }

  render() {
    if(this.state.users) {
      let userRows = this.state.users.map((user, i) => <UserRow key={user.id} user={user} />)

      return(
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone number</TableCell>
              <TableCell>Email address</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {userRows}
          </TableBody>
        </Table>
      )
    } else {
      return(
        <p>Loading...</p>
      )
    }
  }
}

function UserRow(props: IUserProps) {
  const { name, address, phoneNumber, email } = props.user;
  return(
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{address}</TableCell>
      <TableCell>{phoneNumber}</TableCell>
      <TableCell>{email}</TableCell>
    </TableRow>
  );
}

export default Users
