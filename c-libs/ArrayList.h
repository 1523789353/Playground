struct LinkedNode
{
    void* data;
    LinkedNode *next;
};

LinkedNode append(LinkedNode node, void* data)
{
    LinkedNode *newNode = new LinkedNode;
    newNode->data = data;
    newNode->next = NULL;
    node.next = newNode;
    return *newNode;
}
