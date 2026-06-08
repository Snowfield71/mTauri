import type { WindowConfigData } from "../../../types/auth";
import type { SaveAccountData } from '../../../types/auth'

export const createForgetPwdConfig = (account?: SaveAccountData): WindowConfigData => {
  const accountDataStr = account ? encodeURIComponent(JSON.stringify(account)) : undefined
  
  return {
    label: "forgetPwd",
    title: "",
    width: 400,
    height: 400,
    x: 800,
    y: 200,
    maximize: false,
    resizable: false,
    maximizable: false,
    route: accountDataStr ? `/auth/forgetPwd?accountData=${accountDataStr}` : "/auth/forgetPwd",
  }
}
