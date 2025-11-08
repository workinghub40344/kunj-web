
export interface IOrderItem {
    productName: string;
    quantity: number;
    size: string;
    sizeType: string;
    price: number;
    image: string;
    customization?: string;
    _id: string;
    pagdi?: {
        type: string;
        size: string;
        price: number;
    };
}

export interface IOrder {
    _id: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    orderItems: IOrderItem[];
    totalPrice: number;
    createdAt: string;
}