export interface UserState {
  messageId?: number;
  setWalletRequested?: boolean;
}

export const userStates: Record<number, UserState> = {};

export const updateUserState = (userId: number, state: UserState) => {
  userStates[userId] = { ...userStates[userId], ...state };
};

export const getUserState = (userId: number) => {
  return userStates[userId];
};
