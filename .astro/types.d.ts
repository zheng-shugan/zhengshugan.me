declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;
	export type CollectionEntry<C extends keyof AnyEntryMap> = Flatten<AnyEntryMap[C]>;

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"2023-12-24-new-homepage.md": {
	id: "2023-12-24-new-homepage.md";
  slug: "2023-12-24-new-homepage";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"index.md": {
	id: "index.md";
  slug: "index";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-02-11-helloworld.md": {
	id: "zh/2022-02-11-helloworld.md";
  slug: "zh/2022-02-11-helloworld";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-03-09-macbookpro.md": {
	id: "zh/2022-03-09-macbookpro.md";
  slug: "zh/2022-03-09-macbookpro";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-04-21-react-component-communication.md": {
	id: "zh/2022-04-21-react-component-communication.md";
  slug: "zh/2022-04-21-react-component-communication";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-05-28-2022maynote.md": {
	id: "zh/2022-05-28-2022maynote.md";
  slug: "zh/2022-05-28-2022maynote";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-06-13-dvanote.md": {
	id: "zh/2022-06-13-dvanote.md";
  slug: "zh/2022-06-13-dvanote";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-06-28-reactwithts.md": {
	id: "zh/2022-06-28-reactwithts.md";
  slug: "zh/2022-06-28-reactwithts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-07-22-mockdata.md": {
	id: "zh/2022-07-22-mockdata.md";
  slug: "zh/2022-07-22-mockdata";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-07-31-aboutconst.md": {
	id: "zh/2022-07-31-aboutconst.md";
  slug: "zh/2022-07-31-aboutconst";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-08-31-first-language.md": {
	id: "zh/2022-08-31-first-language.md";
  slug: "zh/2022-08-31-first-language";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-09-13-aboutlearnnewprogramminglang.md": {
	id: "zh/2022-09-13-aboutlearnnewprogramminglang.md";
  slug: "zh/2022-09-13-aboutlearnnewprogramminglang";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-10-05-your-mind-palace.md": {
	id: "zh/2022-10-05-your-mind-palace.md";
  slug: "zh/2022-10-05-your-mind-palace";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-10-20-to-use-opensource.md": {
	id: "zh/2022-10-20-to-use-opensource.md";
  slug: "zh/2022-10-20-to-use-opensource";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-11-30-toolchain-source-config.md": {
	id: "zh/2022-11-30-toolchain-source-config.md";
  slug: "zh/2022-11-30-toolchain-source-config";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2022-12-27-covid-19-review.md": {
	id: "zh/2022-12-27-covid-19-review.md";
  slug: "zh/2022-12-27-covid-19-review";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-01-17-vue-vitest-test.md": {
	id: "zh/2023-01-17-vue-vitest-test.md";
  slug: "zh/2023-01-17-vue-vitest-test";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-01-22-fly-to-2023.md": {
	id: "zh/2023-01-22-fly-to-2023.md";
  slug: "zh/2023-01-22-fly-to-2023";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-04-04-alt-ai.md": {
	id: "zh/2023-04-04-alt-ai.md";
  slug: "zh/2023-04-04-alt-ai";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-04-08-programming-experiencev1.md": {
	id: "zh/2023-04-08-programming-experiencev1.md";
  slug: "zh/2023-04-08-programming-experiencev1";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-06-04-good-projects.md": {
	id: "zh/2023-06-04-good-projects.md";
  slug: "zh/2023-06-04-good-projects";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-06-12-about-graduation-project.md": {
	id: "zh/2023-06-12-about-graduation-project.md";
  slug: "zh/2023-06-12-about-graduation-project";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-06-24-i-graduated.md": {
	id: "zh/2023-06-24-i-graduated.md";
  slug: "zh/2023-06-24-i-graduated";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-07-29-first-job.md": {
	id: "zh/2023-07-29-first-job.md";
  slug: "zh/2023-07-29-first-job";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2023-12-24-new-homepage.md": {
	id: "zh/2023-12-24-new-homepage.md";
  slug: "zh/2023-12-24-new-homepage";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-01-01-new-year.md": {
	id: "zh/2024-01-01-new-year.md";
  slug: "zh/2024-01-01-new-year";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-07-28-why-iPhone.md": {
	id: "zh/2024-07-28-why-iPhone.md";
  slug: "zh/2024-07-28-why-iphone";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-08-26-stand-by-me.md": {
	id: "zh/2024-08-26-stand-by-me.md";
  slug: "zh/2024-08-26-stand-by-me";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-09-19-iphone-mirroring.md": {
	id: "zh/2024-09-19-iphone-mirroring.md";
  slug: "zh/2024-09-19-iphone-mirroring";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-10-16-casual-smartphone-purchase-analysis.md": {
	id: "zh/2024-10-16-casual-smartphone-purchase-analysis.md";
  slug: "zh/2024-10-16-casual-smartphone-purchase-analysis";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-10-17-what-i-talk-about-when-i-talk-about-running.md": {
	id: "zh/2024-10-17-what-i-talk-about-when-i-talk-about-running.md";
  slug: "zh/2024-10-17-what-i-talk-about-when-i-talk-about-running";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2024-11-06-xiaomi15.md": {
	id: "zh/2024-11-06-xiaomi15.md";
  slug: "zh/2024-11-06-xiaomi15";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2025-01-01-new-year.md": {
	id: "zh/2025-01-01-new-year.md";
  slug: "zh/2025-01-01-new-year";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zh/2025-03-24-about-code-passion.md": {
	id: "zh/2025-03-24-about-code-passion.md";
  slug: "zh/2025-03-24-about-code-passion";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"tags": {
"[...all].md": {
	id: "[...all].md";
  slug: "all";
  body: string;
  collection: "tags";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
