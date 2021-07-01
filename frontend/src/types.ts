export interface IChain {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: { gender: [string] };
  published: boolean;
}

export interface IUser {
  uid: string | null;
  email: string;
  address: string;
  name: string;
  phoneNumber: string;
  chainId: string | null;
  emailVerified: boolean;
  newsletter: boolean;
  actionsNewsletter: boolean;
  role: string | null;
}
