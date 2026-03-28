import type {
  ProductLookupResult,
} from '../types';
import {
  ProductNotFoundError,
  NetworkError,
  ServiceUnavailableError,
} from '../types';
import { logError } from '../firebase/crashlytics';

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';
const TIMEOUT_MS = 8000;
const USER_AGENT =
  process.env.EXPO_PUBLIC_OPENFOODFACTS_USER_AGENT ??
  'MigraineScan/1.0 (com.migrainescan.app)';

// ─── Main lookup ──────────────────────────────────────────────────────────────

export async function lookupProduct(
  barcode: string,
): Promise<ProductLookupResult> {
  const url = `${BASE_URL}/${encodeURIComponent(barcode)}.json`;

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        throw new ProductNotFoundError(barcode);
      }

      if (response.status >= 500) {
        throw new ServiceUnavailableError(
          `OpenFoodFacts returned ${response.status}`,
        );
      }

      if (!response.ok) {
        throw new NetworkError(
          `Unexpected response: ${response.status}`,
        );
      }

      const json = await response.json() as OFFApiResponse;

      if (json.status === 0) {
        throw new ProductNotFoundError(barcode);
      }

      return normalizeProduct(barcode, json.product);
    } catch (err) {
      // Never retry ProductNotFoundError — it's a data issue, not transient
      if (err instanceof ProductNotFoundError) throw err;

      lastError = err;

      if (attempt === 0) {
        // Short delay before retry
        await sleep(800);
        continue;
      }
    }
  }

  logError(lastError, `lookupProduct(${barcode})`);

  if (lastError instanceof ServiceUnavailableError) throw lastError;
  throw new NetworkError('Failed to reach OpenFoodFacts after retry');
}

// ─── Normalization ────────────────────────────────────────────────────────────

function normalizeProduct(
  barcode: string,
  product: OFFProduct | undefined,
): ProductLookupResult {
  if (!product) {
    return {
      barcode,
      productFound: false,
      productName: '',
      brandName: null,
      ingredientsTextRaw: '',
    };
  }

  const productName =
    product.product_name_en ??
    product.product_name ??
    'Unknown Product';

  const brandName = product.brands ?? null;

  const ingredientsTextRaw =
    product.ingredients_text_en ??
    product.ingredients_text ??
    '';

  return {
    barcode,
    productFound: true,
    productName: productName.trim(),
    brandName: brandName?.trim() ?? null,
    ingredientsTextRaw: ingredientsTextRaw.trim(),
    ingredientsTags: product.ingredients_tags ?? [],
    additivesTags: product.additives_tags ?? [],
    categoriesTags: product.categories_tags ?? [],
  };
}

// ─── Fetch with timeout ───────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') {
      throw new NetworkError('Request timed out');
    }
    throw new NetworkError((err as Error).message);
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── OpenFoodFacts API types (minimal) ───────────────────────────────────────

interface OFFApiResponse {
  status: number;
  product?: OFFProduct;
}

interface OFFProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  ingredients_tags?: string[];
  additives_tags?: string[];
  categories_tags?: string[];
}
