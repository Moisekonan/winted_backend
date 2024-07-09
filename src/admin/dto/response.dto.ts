export interface IResponse<T> {
  success: boolean;
  data?: T[] | T;
  error?: string;
  total?: number;
}
