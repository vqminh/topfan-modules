import {
  createRequestOptions,
  logError,
  sendGetRequest,
  sendPostRequest,
  sendRequest,
} from "./request";
import { SITE_NAME } from "../../src/settings/site-settings";
import { getOriginal } from "../utils/id";
import { EventType, IdolType, ProductInfo } from "../../src/framework/basic-rest/booking-types";
import { getFirestore } from "firebase-admin/firestore";
import { EVENTS, IDOLS } from "../../src/utils/constants";
import {SHOPIFY_DOMAIN} from "../utils/env";

const GRAPHQL = "/admin/api/2021-07/graphql.json";
const access_token = process.env.SHOPIFY_ACCESS_TOKEN;
const headers = {
  "X-Shopify-Access-Token": access_token,
  "Content-Type": "application/json",
};
export const META_FIELD_NS = "info";
export const META_FIELD_KEY = "fields";
const options = ["Người khác", "Chính tôi", "Doanh nghiệp"];

const productFields = `id
      handle
      metafield(namespace: "${META_FIELD_NS}", key: "${META_FIELD_KEY}"){
        id
      }
      media(first: 10){
        edges{
          node{
            mediaContentType
            status
            ... on Video {
              id
              sources{
                url
                format
                width
                height
              }
              originalSource{
                url
                width
                height
              }
            }
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            src: transformedSrc(maxWidth: 400)
            altText
            width
            height
          }
        }
      }
      hasOnlyDefaultVariant
      variants(first: 10) {
        edges {
          node {
            id
            sku
          }
        }
      }`;

const errorFields = `userErrors {
            field
            message
          }`;

function getMetafields(shopifyMetafieldId: string, value: any) {
  return [
    {
      key: META_FIELD_KEY,
      id: shopifyMetafieldId,
      value: JSON.stringify(value),
      namespace: META_FIELD_NS,
      valueType: "JSON_STRING",
    },
  ];
}

/**
 * https://shopify.dev/api/admin/graphql/reference/products-and-collections/productcreate
 * @param idol
 * @param product
 */
export async function createIdolProduct(idol: string, product: ProductInfo) {
  const {
    shopifyMetafieldId,
    displayName,
    slug,
    bio,
    intro,
    charity_pct,
    video,
    professions,
    rate_business,
    show_rate,
  } = product;
  console.log(rate_business);
  const input = {
    title: displayName,
    handle: slug,
    descriptionHtml: bio,
    productType: "Idol",
    vendor: SITE_NAME,
    options: ["Video dành cho"],
    tags: professions,
    metafields: getMetafields(shopifyMetafieldId, {
      idol,
      intro,
      charity_pct,
      video,
      rate_business,
      show_rate,
    }),
    images: toImages(product),
    variants: toVariants(product),
    // access denied to publish to topfan
    // publications: [
    //   {
    //     publicationId: "gid://shopify/Publication/76117082269"
    //   }
    // ],
  };
  return createProduct(input);
}

export async function createEventProduct(refId: string, event: EventType) {
  const {
    shopifyMetafieldId,
    displayName,
    slug,
    intro,
    location,
    scheduledDateTime,
    bio,
  } = event;
  const input = {
    title: displayName,
    handle: slug,
    descriptionHtml: intro,
    productType: EVENTS,
    vendor: SITE_NAME,
    options: [],
    metafields: getMetafields(shopifyMetafieldId, {
      refId,
      location,
      scheduledDateTime,
      bio,
    }),
    images: toImages(event),
    variants: toVariant(event),
  };
  return createProduct(input);
}

export async function createProduct(input: any) {
  let slug = input.handle;
  const query = `mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
        productCreate(input: $input, media: $media) {
          product {
            ${productFields}
          }
          ${errorFields}
        }
      }`;
  try {
    const json = await postWithVariables(
      query,
      { input, media: [] },
      "productCreate",
      input.title.endsWith(" test")
    );
    const shopifyProduct = json.product;
    const { id, handle, metafield } = shopifyProduct;
    if (handle !== slug) {
      logError(
        `Shopify rejected handle ${slug} and replaced it with ${handle}`
      );
    }
    return {
      id,
      handle,
      metafieldId: metafield.id,
    };
  } catch (e: any) {
    logError(e);
    throw e;
  }
}

function toVariants(product: ProductInfo) {
  const { slug, rate, rate_business } = product;
  return [rate, rate, rate_business]
    .filter((r) => !!r)
    .map((r, index) => ({
      sku: `${slug}-${index}`,
      inventoryItem: {
        tracked: false,
      },
      options: [options[index]],
      weight: 0,
      price: String(r),
      requiresShipping: false,
    }));
}

function toVariant(product: ProductInfo) {
  const { slug, rate } = product;
  return [rate]
    .filter((r) => !!r)
    .map((r) => ({
      sku: `${slug}`,
      inventoryItem: {
        tracked: false,
      },
      options: ["Vé"],
      weight: 0,
      price: String(r),
      requiresShipping: false,
    }));
}

function toImages(product: ProductInfo) {
  const { photo, displayName } = product;
  return [
    {
      src: getOriginal(photo),
      altText: displayName,
    },
  ];
}

export async function pushIdolProduct(uid: string, idol: IdolType) {
  const { shopifyId } = idol;
  if (shopifyId) {
    await updateIdolProduct(uid, idol);
  } else {
    const { id, metafieldId, handle } = await createIdolProduct(uid, idol);
    await getFirestore()
      .collection(IDOLS)
      .doc(uid)
      .update({
        slug: handle,
        shopifyId: id,
        shopifyMetafieldId: metafieldId,
      } as Partial<IdolType>);
  }
}

export async function pushEventProduct(uid: string, event: EventType) {
  const { shopifyId } = event;

  if (shopifyId) {
    await updateEventProduct(uid, event);
  } else {
    const { id, metafieldId, handle } = await createEventProduct(uid, event);
    await getFirestore()
      .collection(EVENTS)
      .doc(uid)
      .update({
        slug: handle,
        shopifyId: id,
        shopifyMetafieldId: metafieldId,
      } as Partial<IdolType>);
  }
}

export async function updateEventProduct(refId: string, event: EventType) {
  const { intro, shopifyMetafieldId } = event;
  return updateProduct(event, {
    descriptionHtml: intro,
    options: [],
    tags: [],
    metafields: getMetafields(shopifyMetafieldId, { event: refId }),
  });
}

export async function updateIdolProduct(idol: string, product: IdolType) {
  const {
    bio,
    professions,
    shopifyMetafieldId,
    intro,
    charity_pct,
    video,
    rate_business,
    show_rate,
  } = product;
  return updateProduct(product, {
    descriptionHtml: bio,
    options: professions?.length ? ["Nghề nghiệp"] : [],
    tags: professions?.length ? professions : [],
    metafields: getMetafields(shopifyMetafieldId, {
      idol,
      intro,
      charity_pct,
      video,
      rate_business,
      show_rate,
    }),
  });
}

export async function updateProduct(product: ProductInfo, shopifyInput: any) {
  const { displayName, slug, shopifyId } = product;

  const input: any = {
    id: shopifyId,
    title: displayName,
    handle: slug,
    redirectNewHandle: true,
    images: toImages(product), // have to set images as well to match with variants' images or else variant image won't work
    variants: toVariants(product),
    ...shopifyInput,
  };
  const query = `mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            ${productFields}
          }
          ${errorFields}
        }
      }`;
  try {
    const json = await postWithVariables(
      query,
      { input },
      "productUpdate",
      displayName.endsWith(" test")
    );
    return json.product;
  } catch (e: any) {
    logError(`Could not update product: ${JSON.stringify(input)}`, e);
    // show admin the error
    throw e;
  }
}

export function postWithVariables(
  query: string,
  variables: any,
  operation: string,
  trace?: boolean
) {
  const data = variables ? { query, variables } : { query };
  return post(data, operation, trace);
}

export function post(data: any, operation: string, trace?: boolean) {
  data.query = data.query.replace(/\n/g, " ");
  if (trace) {
    console.log(data.query);
    console.log(JSON.stringify(data.variables));
  }
  return sendPostRequest(
    SHOPIFY_DOMAIN,
    GRAPHQL,
    headers,
    data,
    operation
  ).then((json: any) => {
    const userErrors =
      json.errors ||
      json.data[operation]?.userErrors ||
      json.data[operation]?.mediaUserErrors ||
      json.errors ||
      []; // query
    if (userErrors.length) {
      logError(data.query);
      logError(JSON.stringify(data.variables, null, 2));
      throw new Error(operation + ": " + JSON.stringify(userErrors, null, 2));
    } else {
      return json.data[operation];
    }
  });
}

export function justPublished(publishedAt?: string) {
  if (publishedAt) {
    const publishedAtTime = new Date(publishedAt).getTime();
    const elapsed = new Date().getTime() - publishedAtTime;
    return elapsed < 3600000;
  }
  return false;
}

export type Move = { id: string; newPosition: string };

export function deleteVariant() {
  const query = `mutation DeleteProductShowVariant($id: ID!) {
      productVariantDelete(id: $id) {
        userErrors {
          field
          message
        }
        product {
          id
          hasOnlyDefaultVariant
          variants(first: 100) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }`;
  return postWithVariables(query, null, "productVariantDelete");
}

export function deleteProduct(id: string) {
  const query = `mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }`;
  return postWithVariables(
    query,
    {
      input: {
        id,
      },
    },
    "productDelete"
  );
}

export function getResource(path: string, operation: string) {
  return sendRequest(
    createRequestOptions(SHOPIFY_DOMAIN, path, "GET", headers),
    null,
    operation
  ).then((json) => {
    if (json.error) {
      throw new Error(json.error);
    }
    return json;
  });
}

export function queryProductMedia(id: string) {
  const query = `{
  product(id: "gid://shopify/Product/${id}") {
      handle
      onlineStorePreviewUrl
      media(first: 11){
        edges{
          node{
            mediaContentType
            status
            ... on Video {
              id
              sources{
                url
                format
                width
                height
              }
              originalSource{
                url
                width
                height
              }
            }
          }
        }
      }
    }
  }`;
  return postWithVariables(query, null, "product");
}

/**
 * This only works with shopify plus so cannot use yet
 * https://shopify.dev/api/admin/graphql/reference/products-and-collections/publishablepublish
 * @param id
 */
export function publishProduct(id: string) {
  const query = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable {
      availablePublicationCount
      publicationCount
    }
    ${errorFields}
  }
}
`;
  const variables = {
    id,
    input: [
      {
        publicationId: "gid://shopify/Publication/76117082269",
      },
    ],
  };
  return postWithVariables(query, variables, "publishablePublish");
}

export function queryProductMetafields(id: string) {
  const query = `{
  product(id: "gid://shopify/Product/${id}") {
      fields: metafield(namespace: "info", key: "fields"){
        value
      }
    }
  }`;
  return postWithVariables(query, null, "product").then((product) =>
    JSON.parse(product.fields.value)
  );
}

export function queryProductSummary(id: string) {
  const query = `{
  product(id: "gid://shopify/Product/${id}") {
      handle
      title
      vendor
      price: priceRangeV2 {
        minVariantPrice {
          amount
        }
      }
      images(first: 1) {
        edges {
          node {
            id
            src: transformedSrc(maxWidth: 100)
            altText
            width
            height
          }
        }
      }
    }
  }`;
  return postWithVariables(query, null, "product");
}

export function updateMetafield(id: string, value: any) {
  const options = createRequestOptions(
    SHOPIFY_DOMAIN,
    `/admin/api/2021-01/metafields/${id}.json`,
    "PUT",
    headers
  );
  return sendRequest(
    options,
    {
      metafield: {
        id,
        value: JSON.stringify(value),
      },
    },
    "metafield"
  );
}

export function createMetafield(namespace: string, key: string, value: any) {
  const options = createRequestOptions(
    SHOPIFY_DOMAIN,
    `/admin/api/2021-01/metafields.json`,
    "POST",
    headers
  );
  return sendRequest(
    options,
    {
      metafield: {
        namespace,
        key,
        value: JSON.stringify(value),
        value_type: "json_string",
      },
    },
    "metafield"
  );
}

export function createProductMetafield(
  productId: string,
  namespace: string,
  key: string,
  value: any
) {
  return postWithVariables(
    `mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            metafield(namespace: "${namespace}", key: "${key}"){
              id
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      input: {
        id: `gid://shopify/Product/${productId}`,
        metafields: {
          namespace,
          key,
          value: JSON.stringify(value),
          valueType: "JSON_STRING",
        },
      },
    },
    "productUpdate"
  );
}

export function publishProductMetafield(namespace: string, key: string) {
  return postWithVariables(
    `mutation metafieldStorefrontVisibilityCreate($input: MetafieldStorefrontVisibilityInput!) {
      metafieldStorefrontVisibilityCreate(input: $input) {
        metafieldStorefrontVisibility {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      input: {
        namespace,
        key,
        ownerType: "PRODUCT",
      },
    },
    "metafieldStorefrontVisibilityCreate"
  );
}

export function updateProductMetafield(
  productId: string,
  value: any,
  key?: string,
  namespace?: string,
  id?: string
) {
  const metafields: any = {
    value: JSON.stringify(value),
    valueType: "JSON_STRING",
  };
  let metafieldId = "";
  if (id) {
    metafields.id = id;
  } else {
    metafieldId = `metafield(namespace: "${namespace}", key: "${key}"){
          id
        }`;
    metafields.key = key;
    metafields.namespace = namespace;
  }
  return postWithVariables(
    `mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            ${metafieldId}
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      input: {
        id: `gid://shopify/Product/${productId}`,
        metafields,
      },
    },
    "productUpdate"
  );
}

export function getProductMetafields(productId: string) {
  return sendGetRequest(
    SHOPIFY_DOMAIN,
    `/admin/api/2021-04/products/${productId}/metafields.json`,
    "metafields",
    headers
  );
}

export function addRedirect(path: string, target: string) {
  return sendPostRequest(
    SHOPIFY_DOMAIN,
    "/admin/api/2021-01/redirects.json",
    headers,
    {
      redirect: {
        path,
        target,
      },
    },
    "redirect"
  );
}

export function privateAppPost(data: any, operation: string) {
  const auth =
    "Basic " +
    Buffer.from(
      "4a6c8a9673d92b98b7d5bda9793f92d6" +
        ":" +
        "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"
    ).toString("base64");
  return sendPostRequest(
    SHOPIFY_DOMAIN,
    GRAPHQL,
    {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    data,
    operation
  ).then((json: any) => {
    const userErrors =
      json.errors ||
      json.data[operation]?.userErrors ||
      json.data[operation]?.mediaUserErrors ||
      json.errors ||
      []; // query
    if (userErrors.length) {
      logError(data.query);
      logError(JSON.stringify(data.variables));
      throw new Error(operation + ": " + JSON.stringify(userErrors));
    } else {
      return json.data[operation];
    }
  });
}

export function createPage(title: string, body_html: string) {
  const data = { page: { title, body_html } };
  return sendPostRequest(
    SHOPIFY_DOMAIN,
    "/admin/api/2021-01/pages.json",
    headers,
    data,
    "page"
  );
}

export function requires(object: any, ...fields: string[]) {
  if (Array.isArray(object)) {
    object.forEach((o) => requires(o, ...fields));
  } else {
    const toCheck = fields && fields.length ? fields : Object.keys(object);
    toCheck.forEach((f) => {
      if (object[f]) {
        // has value
      } else {
        throw new Error("Missing: " + f);
      }
    });
  }
}
