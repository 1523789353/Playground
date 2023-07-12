#ifndef REDBLACKTREE_H

struct RedBlackTree
{
    void *value;
    char *typePrompt;
    RedBlackTree *left;
    RedBlackTree *right;
    RedBlackTree *parent;
    bool color;
};


#define REDBLACKTREE_H
