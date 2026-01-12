export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  productType?: string; // CLOTHING, PHONE_CASE, GENERIC
  availableSizes?: string[]; // For CLOTHING: ["XS", "S", "M", "L", "XL", "XXL"]
  availableModels?: string[]; // For PHONE_CASE: iPhone models
  availableColors?: string[]; // For all product types: ["Red", "Blue", "Black", etc.]
  requiresFootSize?: boolean; // Whether product requires foot size selection
  availableFootSizes?: string[]; // European foot sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
}
