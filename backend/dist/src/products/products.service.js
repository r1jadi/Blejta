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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.product.findMany({ orderBy: { id: 'desc' } });
    }
    findOne(id) {
        return this.prisma.product.findUnique({ where: { id } });
    }
    validateVariants(productType, availableSizes, availableModels, requiresFootSize, availableFootSizes) {
        if (productType === 'CLOTHING') {
            if (!availableSizes || availableSizes.length === 0) {
                throw new common_1.BadRequestException('At least one size must be selected for CLOTHING products');
            }
            const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            const invalidSizes = availableSizes.filter(size => !validSizes.includes(size));
            if (invalidSizes.length > 0) {
                throw new common_1.BadRequestException(`Invalid sizes: ${invalidSizes.join(', ')}. Valid sizes are: ${validSizes.join(', ')}`);
            }
        }
        else if (productType === 'PHONE_CASE') {
            if (!availableModels || availableModels.length === 0) {
                throw new common_1.BadRequestException('At least one iPhone model must be selected for PHONE_CASE products');
            }
        }
        else if (productType === 'GENERIC') {
        }
        else {
            throw new common_1.BadRequestException(`Invalid product type: ${productType}. Must be CLOTHING, PHONE_CASE, or GENERIC`);
        }
        if (requiresFootSize && (!availableFootSizes || availableFootSizes.length === 0)) {
            throw new common_1.BadRequestException('At least one foot size must be selected when requiresFootSize is true');
        }
    }
    create(createProductDto) {
        const productType = createProductDto.productType || 'GENERIC';
        this.validateVariants(productType, createProductDto.availableSizes, createProductDto.availableModels, createProductDto.requiresFootSize, createProductDto.availableFootSizes);
        return this.prisma.product.create({
            data: {
                name: createProductDto.name,
                description: createProductDto.description || null,
                price: createProductDto.price,
                images: createProductDto.images || [],
                productType,
                availableSizes: createProductDto.availableSizes || null,
                availableModels: createProductDto.availableModels || null,
                availableColors: createProductDto.availableColors || null,
                requiresFootSize: createProductDto.requiresFootSize || false,
                availableFootSizes: createProductDto.availableFootSizes || null,
            },
        });
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        const productType = updateProductDto.productType !== undefined
            ? updateProductDto.productType
            : product.productType || 'GENERIC';
        const availableSizes = updateProductDto.availableSizes !== undefined
            ? updateProductDto.availableSizes
            : product.availableSizes;
        const availableModels = updateProductDto.availableModels !== undefined
            ? updateProductDto.availableModels
            : product.availableModels;
        const requiresFootSize = updateProductDto.requiresFootSize !== undefined
            ? updateProductDto.requiresFootSize
            : (product.requiresFootSize || false);
        const availableFootSizes = updateProductDto.availableFootSizes !== undefined
            ? updateProductDto.availableFootSizes
            : product.availableFootSizes;
        this.validateVariants(productType, availableSizes, availableModels, requiresFootSize, availableFootSizes);
        return this.prisma.product.update({
            where: { id },
            data: {
                ...(updateProductDto.name && { name: updateProductDto.name }),
                ...(updateProductDto.description !== undefined && {
                    description: updateProductDto.description || null
                }),
                ...(updateProductDto.price && { price: updateProductDto.price }),
                ...(updateProductDto.images && { images: updateProductDto.images }),
                ...(updateProductDto.productType !== undefined && { productType: updateProductDto.productType }),
                ...(updateProductDto.availableSizes !== undefined && {
                    availableSizes: updateProductDto.availableSizes || null
                }),
                ...(updateProductDto.availableModels !== undefined && {
                    availableModels: updateProductDto.availableModels || null
                }),
                ...(updateProductDto.availableColors !== undefined && {
                    availableColors: updateProductDto.availableColors || null
                }),
                ...(updateProductDto.requiresFootSize !== undefined && {
                    requiresFootSize: updateProductDto.requiresFootSize
                }),
                ...(updateProductDto.availableFootSizes !== undefined && {
                    availableFootSizes: updateProductDto.availableFootSizes || null
                }),
            },
        });
    }
    async remove(id) {
        const product = await this.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return this.prisma.product.delete({
            where: { id },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map