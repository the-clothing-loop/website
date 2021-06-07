export interface IChain {
  id: string;
  name: string;
  description: string;
  image: string;
  address:string;
}

export interface IUser {
  uid: string;
  email: string;
  address: string;
  name: string;
  phoneNumber: string;
  chainId: string;
  emailVerified: boolean;
  checkedNewsletter: boolean;
  checkedActionsNewsletter: boolean;
}
