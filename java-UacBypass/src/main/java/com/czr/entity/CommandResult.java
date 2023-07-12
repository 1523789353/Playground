package com.czr.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public class CommandResult {
    public static final CommandResult empty = new CommandResult(new ArrayList<>(), false, 0, "", "");

    private final List<String> command;
    private final boolean withAdminPerm;
    private final int returnCode;
    private final String stdout;
    private final String stderr;
}
