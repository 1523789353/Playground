package com.czr;

import com.czr.entity.CommandResult;
import com.czr.tools.Authenticator;
import com.czr.tools.Command;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("验证码: " + Authenticator.gen());

        Scanner in = new Scanner(System.in);

        System.out.println("请输入验证码：");
        String code = in.nextLine();

        if (Authenticator.verify(code)) {
            System.out.println("验证成功");
        }
    }
}