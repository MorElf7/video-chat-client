export interface QueriesRequest {
  page: string;
  pageSize: string
}

export interface RoomQueries extends QueriesRequest{
  type: string;
}

export interface RoomRequest {
  type: string;
}