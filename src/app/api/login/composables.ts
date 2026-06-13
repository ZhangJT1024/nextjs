import {LoginParamsType} from "@/types"
import {isEmpty} from "@/utils"
import { isValid } from "zod";
 /**
   * 账号校验：至少一位字母，长度 5-20 位
   */
   const isAccountValid = (account: string): boolean => {
    const regex = /^(?=.*[a-zA-Z]).{5,20}$/;
    return regex.test(account);
  };

  /**
   * 密码校验：至少一位字母，长度 5-20 位
   */
   const isPasswordValid = (password: string): boolean => {
    const regex = /^(?=.*[a-zA-Z]).{5,20}$/;
    return regex.test(password);
  };

  /**
   * 昵称校验：长度 2-10 位
   */
   const isNicknameValid = (nickname: string): boolean => {
    const regex = /^.{2,10}$/;
    return regex.test(nickname);
  };
/**
 * 校验创建账号参数
 * */ 
export const checkCreateAccountsParams  = (params:LoginParamsType)=>{
    // 参数是否齐全
         if(Object.values(params).every(value=>isEmpty(value))){
            return {
                 isValid: false,
                message: {
                code: 400,
                message: "参数错误",
                data: null,
            },
            }
    }else if(!isAccountValid(params.account)) {
        return {
            isValid: false,
            message: {
                code: 400,
                message: "账号格式错误",
                data: null,
            },
        }
    }else if(!isPasswordValid(params.password)) {
        return {
            isValid: false,
            message: {
                code: 400,
                message: "密码格式错误",
                data: null,
            },
        }
    }else if(!isNicknameValid(params.nickname)) {
        return {
            isValid: false,
            message: {
                code: 400,
                message: "昵称格式错误",
                data: null,
            },
        }
    }else{
        return {
            isValid: true,
        }
    }
}

