type UserInfoData = {
  userId?: number;
  nickname: string;
  account: string;
  token?: string;
  avatar: string;
};

type VerifyPhone = {
  type: string;
  value: string;
  name: string;
};

type LoginFormData = {
  account: string;
  password?: string;
};

type TokenLogin = {
  account: string;
  token: string;
  userId: number;
};

type AccountData = {
  avatar: string;
  account: string;
  password: string;
};

type SaveAccountData = {
  avatar: string;
  account: string;
};

type AreaCodeData = {
  code: string;
  name: string;
};

type UpdateData = {
  userId: number;
  file: File | null;
  nickname: string;
  phoneNumber: string;
};

type RegisterFormData = {
  userId: number;
  nickname: string;
  password: string;
  phoneNumber: string;
  code: string;
  avatarUrl: string;
};

type WindowConfigData = {
  label: string;
  title: string;
  width?: number;
  height?: number;
  resizable: boolean;
  maximizable: boolean;
  route: string;
  x?: number;
  y?: number;
  maximize?: boolean;
  userData?: string;
  disableContextMenu?: boolean;
};

type FindMethodsCardContentData = {
  name: string;
  title: string;
  description: string;
  imgSrc: string;
  queryParams?: Record<string, string | number>;
};

type PhoneNumberAndCode = {
  phoneNumber: string;
  code: string;
};

export type {
  UserInfoData,
  FindMethodsCardContentData,
  LoginFormData,
  AccountData,
  SaveAccountData,
  WindowConfigData,
  AreaCodeData,
  RegisterFormData,
  PhoneNumberAndCode,
  VerifyPhone,
  TokenLogin,
  UpdateData,
};
