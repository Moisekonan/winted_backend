import { IUser } from 'src/users/dtos/user.dto';

export interface ICoreResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface IResponseSignIn extends ICoreResponse {
  token: string;
}

export interface IResponseLogOut extends ICoreResponse {}

export interface IResponseUser extends ICoreResponse {
  content?: IUser;
  item?: IUser;
}

export interface IResponseUsers extends ICoreResponse {
  content: IUser[];
  total: number;
}
