export interface MsgResponse {
  message: string;
  status: number
}

export interface DataResponse<T> {
  data: T;
}

export interface PageResponse<T> {
  data: T[];
  hasNext: boolean;
  totalElements: number;
  totalPages: number
}