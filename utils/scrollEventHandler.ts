
export const reachBottomReverse = (e: any) => {
  return e.target.scrollHeight + e.target.scrollTop === e.target.clientHeight;
};

export const reachBottom = (e: any) => {
  return e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
};

export const reachTop = (e: any) => {
  return e.target.scrollTop === 0;
};