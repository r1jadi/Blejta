"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.order.create({ data });
    }
    createOrder(createOrderDto) {
        return this.prisma.order.create({
            data: {
                userId: createOrderDto.userId || null,
                items: createOrderDto.items,
                name: createOrderDto.name,
                address: createOrderDto.address,
                phone: createOrderDto.phone,
                subtotal: createOrderDto.subtotal,
                shippingCost: createOrderDto.shippingCost,
                total: createOrderDto.total,
                status: createOrderDto.status || 'pending',
                paymentStatus: createOrderDto.paymentStatus || 'pending',
                paymentIntentId: createOrderDto.paymentIntentId || null,
            }
        });
    }
    findAll() {
        return this.prisma.order.findMany({
            orderBy: { id: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
    findByUserId(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { id: 'desc' }
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const updateData = {};
        if (updateOrderDto.userId !== undefined) {
            updateData.userId = updateOrderDto.userId;
        }
        if (updateOrderDto.items !== undefined) {
            updateData.items = updateOrderDto.items;
        }
        if (updateOrderDto.name !== undefined) {
            updateData.name = updateOrderDto.name;
        }
        if (updateOrderDto.address !== undefined) {
            updateData.address = updateOrderDto.address;
        }
        if (updateOrderDto.phone !== undefined) {
            updateData.phone = updateOrderDto.phone;
        }
        if (updateOrderDto.subtotal !== undefined) {
            updateData.subtotal = updateOrderDto.subtotal;
        }
        if (updateOrderDto.shippingCost !== undefined) {
            updateData.shippingCost = updateOrderDto.shippingCost;
        }
        if (updateOrderDto.total !== undefined) {
            updateData.total = updateOrderDto.total;
        }
        if (updateOrderDto.status !== undefined) {
            updateData.status = updateOrderDto.status;
        }
        if (updateOrderDto.paymentStatus !== undefined) {
            updateData.paymentStatus = updateOrderDto.paymentStatus;
        }
        if (updateOrderDto.paymentIntentId !== undefined) {
            updateData.paymentIntentId = updateOrderDto.paymentIntentId;
        }
        return this.prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
    updateStatus(id, status) {
        return this.prisma.order.update({
            where: { id },
            data: { status }
        });
    }
    async remove(id) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        await this.prisma.order.delete({
            where: { id },
        });
        return { message: 'Order deleted successfully' };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map