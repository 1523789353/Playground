#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <windows.h>

#define cls() system("cls")

bool **initMap(int width, int height);
void randomMap(bool **map, int width, int height);
void nextTick(bool **map, int width, int height);
void render(bool **map, int width, int height);

int main(void)
{
    cls();
    int width = 30;
    int height = 30;
    bool **map = initMap(width, height);

    randomMap(map, width, height);
    render(map, width, height);

    for (int i = 0; i < 100; i++)
    {
        Sleep(100);
        nextTick(map, width, height);
        cls();
        render(map, width, height);
    }

    freeMap(map, height);
}

bool **initMap(int width, int height)
{
    int pointerSize = sizeof(bool *) * height;
    bool **map = (bool **)malloc(pointerSize);
    memset(map, 0, pointerSize);

    int rowSize = sizeof(bool) * width;

    for (int rowNum = 0; rowNum < height; rowNum++)
    {
        map[rowNum] = (bool *)malloc(rowSize);
    }
    return map;
}

bool *cloneMap(bool **map, int width, int height)
{
    bool **result = initMap(width, height);
    for (int rowNum = 0; rowNum < height; rowNum++)
    {
        for (int index = 0; index < width; index++)
        {
            result[rowNum][index] = map[rowNum][index];
        }
    }
    return result;
}

void freeMap(bool **map, int height)
{
    for (int rowNum = 0; rowNum < height; rowNum++)
    {
        free(map[rowNum]);
    }
    free(map);
}

void randomMap(bool **map, int width, int height)
{
    for (int rowNum = 0; rowNum < height; rowNum++)
    {
        for (int index = 0; index < width; index++)
        {
            map[rowNum][index] = (bool)(rand() % 2);
        }
    }
}

void nextTick(bool **map, int width, int height)
{
    bool **tmp = cloneMap(map, width, height);
    for (int rowNum = 0; rowNum < height; rowNum++)
    {
        for (int index = 0; index < width; index++)
        {
            int count = 0;
            if (rowNum - 1 >= 0 && index - 1 >= 0)
                count += tmp[rowNum - 1][index - 1];
            if (rowNum - 1 >= 0)
                count += tmp[rowNum - 1][index];
            if (rowNum - 1 >= 0 && index + 1 < width)
                count += tmp[rowNum - 1][index + 1];

            if (index - 1 >= 0)
                count += tmp[rowNum][index - 1];
            // self
            // count += map[rowNum][index];
            if (index + 1 < width)
                count += tmp[rowNum][index + 1];

            if (rowNum + 1 < height && index - 1 >= 0)
                count += tmp[rowNum + 1][index - 1];
            if (rowNum + 1 < height)
                count += tmp[rowNum + 1][index];
            if (rowNum + 1 < height && index + 1 < width)
                count += tmp[rowNum + 1][index + 1];

            map[rowNum][index] = count == 2 || count == 3;
        }
    }
    freeMap(tmp, height);
}

void render(bool **map, int width, int height) // 逐行打印
{
    int strSize = sizeof(char) * (width + 1) * height;
    char *str = (char *)malloc(strSize);
    for (int rowNum = 0; rowNum < height; rowNum++)
    {
        for (int index = 0; index < width; index++)
        {
            str[rowNum * (width + 1) + index] = map[rowNum][index] ? '#' : ' ';
        }
        str[(rowNum + 1) * (width + 1) - 1] = '\n';
    }
    str[strSize - 1] = '\0';
    printf(str);
}
