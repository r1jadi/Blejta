import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({ orderBy: { id: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  private validateVariants(
    productType: string, 
    availableSizes?: string[], 
    availableModels?: string[],
    requiresFootSize?: boolean,
    availableFootSizes?: string[]
  ) {
    if (productType === 'CLOTHING') {
      if (!availableSizes || availableSizes.length === 0) {
        throw new BadRequestException('At least one size must be selected for CLOTHING products');
      }
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const invalidSizes = availableSizes.filter(size => !validSizes.includes(size));
      if (invalidSizes.length > 0) {
        throw new BadRequestException(`Invalid sizes: ${invalidSizes.join(', ')}. Valid sizes are: ${validSizes.join(', ')}`);
      }
    } else if (productType === 'PHONE_CASE') {
      if (!availableModels || availableModels.length === 0) {
        throw new BadRequestException('At least one iPhone model must be selected for PHONE_CASE products');
      }
    } else if (productType === 'GENERIC') {
      // No validation needed for GENERIC products
    } else {
      throw new BadRequestException(`Invalid product type: ${productType}. Must be CLOTHING, PHONE_CASE, or GENERIC`);
    }

    // Validate foot size if required
    if (requiresFootSize && (!availableFootSizes || availableFootSizes.length === 0)) {
      throw new BadRequestException('At least one foot size must be selected when requiresFootSize is true');
    }
  }

  create(createProductDto: CreateProductDto) {
    const productType = createProductDto.productType || 'GENERIC';
    
    // Validate variants based on product type
    this.validateVariants(
      productType, 
      createProductDto.availableSizes, 
      createProductDto.availableModels,
      createProductDto.requiresFootSize,
      createProductDto.availableFootSizes
    );

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

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Determine the product type (use existing if not updating, or new if updating)
    const productType = updateProductDto.productType !== undefined 
      ? updateProductDto.productType 
      : (product.productType as string) || 'GENERIC';

    // Get sizes and models (use existing if not updating, or new if updating)
    const availableSizes = updateProductDto.availableSizes !== undefined
      ? updateProductDto.availableSizes
      : (product.availableSizes as string[] | null);
    const availableModels = updateProductDto.availableModels !== undefined
      ? updateProductDto.availableModels
      : (product.availableModels as string[] | null);
    const requiresFootSize = updateProductDto.requiresFootSize !== undefined
      ? updateProductDto.requiresFootSize
      : (product.requiresFootSize as boolean || false);
    const availableFootSizes = updateProductDto.availableFootSizes !== undefined
      ? updateProductDto.availableFootSizes
      : (product.availableFootSizes as string[] | null);

    // Validate variants based on product type
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

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
