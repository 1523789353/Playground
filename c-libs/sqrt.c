// 快速求平方根
double fastSqrt(double number, int iterations)
{
    // 将number转换为int64_t类型
    int64_t bits = *(int64_t *)&number;
    // 对bits进行位运算，得到平方根倒数的近似值
    bits = 0x5fe6eb50c7b537a9 - (bits >> 1);
    // 将bits转换回double类型
    double result = *(double *)&bits;
    // 使用牛顿迭代法进行iterations次修正，提高精度
    for (int i = 0; i < iterations; i++)
    {
        result = result * (1.5 - (result * result * number * 0.5));
    }
    // 返回平方根倒数与n的乘积，即平方根
    return result * number;
}

int main() {
    // Test the function
    printf("%f", fastSqrt(1145141919810, 256));
    return 0;
}
