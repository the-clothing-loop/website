export interface IChain {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface IUser {
  id: string;
  email: string;
  address: string;
  name: string;
  phoneNumber: string;
  chainId: string;
}
