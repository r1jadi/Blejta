export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    images: string[];
    productType?: string;
    availableSizes?: string[];
    availableModels?: string[];
    availableColors?: string[];
    requiresFootSize?: boolean;
    availableFootSizes?: string[];
}
