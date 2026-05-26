// Stained glass patterns catalog. Dev-managed per ADR-0017.
// Records are kept in source-file order (the order they appear in
// content/supplies/patterns/<category>/content.md). Consumers should sort
// by getPatternsByCategory(), which applies the ADR-0017 natural-numeric
// ascending order.

export const PATTERN_CATEGORIES = [
  { slug: "beginner", label: "Beginner" },
  { slug: "intermediate", label: "Intermediate" },
  { slug: "advanced", label: "Advanced" },
  { slug: "mirrors-and-frames", label: "Mirrors & Frames" },
] as const;

export type PatternCategory = (typeof PATTERN_CATEGORIES)[number]["slug"];

export type Pattern = {
  number: string;
  category: PatternCategory;
  price: number;
  image: string;
  alt?: string;
};

export const patterns: readonly Pattern[] = [
  {
    number: "102C",
    category: "beginner",
    price: 6.0,
    image: "beginner-102C.gif",
  },
  {
    number: "103C",
    category: "beginner",
    price: 6.0,
    image: "beginner-103C.gif",
  },
  {
    number: "104C",
    category: "beginner",
    price: 6.0,
    image: "beginner-104C.gif",
  },
  {
    number: "105",
    category: "beginner",
    price: 6.0,
    image: "beginner-105.gif",
  },
  {
    number: "108C",
    category: "beginner",
    price: 6.0,
    image: "beginner-108C.gif",
  },
  {
    number: "109",
    category: "beginner",
    price: 6.0,
    image: "beginner-109.gif",
  },
  {
    number: "110C",
    category: "beginner",
    price: 6.0,
    image: "beginner-110C.gif",
  },
  {
    number: "111",
    category: "beginner",
    price: 6.0,
    image: "beginner-111.gif",
  },
  {
    number: "113C",
    category: "beginner",
    price: 6.0,
    image: "beginner-113C.gif",
  },
  {
    number: "115C",
    category: "beginner",
    price: 6.0,
    image: "beginner-115C.gif",
  },
  {
    number: "118C",
    category: "beginner",
    price: 6.0,
    image: "beginner-118C.gif",
  },
  {
    number: "119C",
    category: "beginner",
    price: 6.0,
    image: "beginner-119C.gif",
  },
  {
    number: "121",
    category: "beginner",
    price: 10.0,
    image: "beginner-121.gif",
  },
  {
    number: "122",
    category: "beginner",
    price: 10.0,
    image: "beginner-122.gif",
  },
  {
    number: "131",
    category: "beginner",
    price: 10.0,
    image: "beginner-131.gif",
  },
  {
    number: "133",
    category: "beginner",
    price: 8.0,
    image: "beginner-133.gif",
  },
  {
    number: "138",
    category: "beginner",
    price: 8.0,
    image: "beginner-138.gif",
  },
  {
    number: "140",
    category: "beginner",
    price: 8.0,
    image: "beginner-140.gif",
  },
  {
    number: "199",
    category: "beginner",
    price: 8.0,
    image: "beginner-199.gif",
  },
  {
    number: "303",
    category: "beginner",
    price: 8.0,
    image: "beginner-303.gif",
  },
  {
    number: "322",
    category: "beginner",
    price: 8.0,
    image: "beginner-322.gif",
  },
  {
    number: "323",
    category: "beginner",
    price: 8.0,
    image: "beginner-323.gif",
  },
  {
    number: "324",
    category: "beginner",
    price: 8.0,
    image: "beginner-324.gif",
  },
  {
    number: "326",
    category: "beginner",
    price: 8.0,
    image: "beginner-326.gif",
  },
  {
    number: "419",
    category: "beginner",
    price: 8.0,
    image: "beginner-419.gif",
  },
  {
    number: "457",
    category: "beginner",
    price: 6.0,
    image: "beginner-457.gif",
  },
  {
    number: "459",
    category: "beginner",
    price: 8.0,
    image: "beginner-459.gif",
  },
  {
    number: "462",
    category: "beginner",
    price: 8.0,
    image: "beginner-462.gif",
  },
  {
    number: "463",
    category: "beginner",
    price: 8.0,
    image: "beginner-463.gif",
  },
  {
    number: "465",
    category: "beginner",
    price: 8.0,
    image: "beginner-465.gif",
  },
  {
    number: "471",
    category: "beginner",
    price: 6.0,
    image: "beginner-471.gif",
  },
  {
    number: "700",
    category: "beginner",
    price: 6.0,
    image: "beginner-700.gif",
  },
  {
    number: "701",
    category: "beginner",
    price: 6.0,
    image: "beginner-701.gif",
  },
  {
    number: "729",
    category: "beginner",
    price: 8.0,
    image: "beginner-729.gif",
  },
  {
    number: "738",
    category: "beginner",
    price: 6.0,
    image: "beginner-738.gif",
  },
  {
    number: "762",
    category: "beginner",
    price: 6.0,
    image: "beginner-762.gif",
  },
  {
    number: "763",
    category: "beginner",
    price: 6.0,
    image: "beginner-763.gif",
  },
  {
    number: "764",
    category: "beginner",
    price: 6.0,
    image: "beginner-764.gif",
  },
  {
    number: "773",
    category: "beginner",
    price: 8.0,
    image: "beginner-773.gif",
  },
  {
    number: "775",
    category: "beginner",
    price: 6.0,
    image: "beginner-775.gif",
  },
  {
    number: "776",
    category: "beginner",
    price: 6.0,
    image: "beginner-776.gif",
  },
  {
    number: "777",
    category: "beginner",
    price: 6.0,
    image: "beginner-777.gif",
  },
  {
    number: "779",
    category: "beginner",
    price: 6.0,
    image: "beginner-779.gif",
  },
  {
    number: "780",
    category: "beginner",
    price: 6.0,
    image: "beginner-780.gif",
  },
  {
    number: "781",
    category: "beginner",
    price: 6.0,
    image: "beginner-781.gif",
  },
  {
    number: "789",
    category: "beginner",
    price: 6.0,
    image: "beginner-789.gif",
  },
  {
    number: "800",
    category: "beginner",
    price: 6.0,
    image: "beginner-800.gif",
  },
  {
    number: "801",
    category: "beginner",
    price: 6.0,
    image: "beginner-801.gif",
  },
  {
    number: "803",
    category: "beginner",
    price: 6.0,
    image: "beginner-803.gif",
  },
  {
    number: "804",
    category: "beginner",
    price: 6.0,
    image: "beginner-804.gif",
  },
  {
    number: "805",
    category: "beginner",
    price: 6.0,
    image: "beginner-805.gif",
  },
  {
    number: "806",
    category: "beginner",
    price: 6.0,
    image: "beginner-806.gif",
  },
  {
    number: "808",
    category: "beginner",
    price: 6.0,
    image: "beginner-808.gif",
  },
  {
    number: "812",
    category: "beginner",
    price: 6.0,
    image: "beginner-812.gif",
  },
  {
    number: "813",
    category: "beginner",
    price: 6.0,
    image: "beginner-813.gif",
  },
  {
    number: "815",
    category: "beginner",
    price: 6.0,
    image: "beginner-815.gif",
  },
  {
    number: "865",
    category: "beginner",
    price: 6.0,
    image: "beginner-865.gif",
  },
  {
    number: "14903",
    category: "beginner",
    price: 6.0,
    image: "beginner-14903.gif",
  },
  {
    number: "107",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-107.gif",
  },
  {
    number: "127",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-127.gif",
  },
  {
    number: "128",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-128.gif",
  },
  {
    number: "130",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-130.gif",
  },
  {
    number: "134",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-134.gif",
  },
  {
    number: "186",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-186.gif",
  },
  {
    number: "195",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-195.gif",
  },
  {
    number: "205",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-205.gif",
  },
  {
    number: "210",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-210.gif",
  },
  {
    number: "230",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-230.gif",
  },
  {
    number: "232",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-232.gif",
  },
  {
    number: "236",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-236.gif",
  },
  {
    number: "329",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-329.gif",
  },
  {
    number: "414",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-414.gif",
  },
  {
    number: "421",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-421.gif",
  },
  {
    number: "427",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-427.gif",
  },
  {
    number: "428",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-428.gif",
  },
  {
    number: "429",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-429.gif",
  },
  {
    number: "430",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-430.gif",
  },
  {
    number: "432",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-432.gif",
  },
  {
    number: "445",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-445.gif",
  },
  {
    number: "446",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-446.gif",
  },
  {
    number: "479",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-479.gif",
  },
  {
    number: "481",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-481.gif",
  },
  {
    number: "487",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-487.gif",
  },
  {
    number: "495",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-495.gif",
  },
  {
    number: "505",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-505.gif",
  },
  {
    number: "576",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-576.gif",
  },
  {
    number: "578",
    category: "intermediate",
    price: 6.0,
    image: "intermediate-578.jpg",
  },
  {
    number: "579",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-579.gif",
  },
  {
    number: "584",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-584.gif",
  },
  {
    number: "586",
    category: "intermediate",
    price: 6.0,
    image: "intermediate-586.jpg",
  },
  {
    number: "599",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-599.gif",
  },
  {
    number: "706",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-706.gif",
  },
  {
    number: "712",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-712.gif",
  },
  // Filenames intermediate-{735,789,790,811,817,819}02 carry the source CMS's
  // "02" suffix that was appended when a numeric stem was reused across
  // categories. The displayed pattern number is the bare one (#735, #789, …).
  {
    number: "735",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-73502.gif",
  },
  {
    number: "789",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-78902.gif",
  },
  {
    number: "790",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-79002.gif",
  },
  {
    number: "802",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-802.gif",
  },
  {
    number: "805",
    category: "intermediate",
    price: 6.0,
    image: "intermediate-805.gif",
  },
  {
    number: "810",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-810.gif",
  },
  {
    number: "811",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-81102.gif",
  },
  {
    number: "817",
    category: "intermediate",
    price: 6.0,
    image: "intermediate-81702.gif",
  },
  {
    number: "819",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-81902.gif",
  },
  {
    number: "830",
    category: "intermediate",
    price: 6.0,
    image: "intermediate-830.gif",
  },
  {
    number: "838",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-838.gif",
  },
  {
    number: "843",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-843.gif",
  },
  {
    number: "848",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-848.gif",
  },
  {
    number: "849",
    category: "intermediate",
    price: 8.0,
    image: "intermediate-849.gif",
  },
  {
    number: "852",
    category: "intermediate",
    price: 10.0,
    image: "intermediate-852.gif",
  },
  {
    number: "431",
    category: "advanced",
    price: 10.0,
    image: "advanced-431.gif",
  },
  {
    number: "442",
    category: "advanced",
    price: 10.0,
    image: "advanced-442.gif",
  },
  {
    number: "488",
    category: "advanced",
    price: 10.0,
    image: "advanced-488.gif",
  },
  {
    number: "572",
    category: "advanced",
    price: 10.0,
    image: "advanced-572.gif",
  },
  {
    number: "741",
    category: "advanced",
    price: 10.0,
    image: "advanced-741.gif",
  },
  {
    number: "744",
    category: "advanced",
    price: 10.0,
    image: "advanced-744.gif",
  },
  {
    number: "745",
    category: "advanced",
    price: 10.0,
    image: "advanced-745.gif",
  },
  {
    number: "746",
    category: "advanced",
    price: 10.0,
    image: "advanced-746.gif",
  },
  {
    number: "755",
    category: "advanced",
    price: 10.0,
    image: "advanced-755.gif",
  },
  {
    number: "765",
    category: "advanced",
    price: 10.0,
    image: "advanced-765.gif",
  },
  {
    number: "766",
    category: "advanced",
    price: 10.0,
    image: "advanced-766.gif",
  },
  {
    number: "767",
    category: "advanced",
    price: 10.0,
    image: "advanced-767.gif",
  },
  {
    number: "769",
    category: "advanced",
    price: 8.0,
    image: "advanced-769.gif",
  },
  {
    number: "791",
    category: "advanced",
    price: 8.0,
    image: "advanced-791.gif",
  },
  {
    number: "792",
    category: "advanced",
    price: 10.0,
    image: "advanced-792.gif",
  },
  {
    number: "795",
    category: "advanced",
    price: 10.0,
    image: "advanced-795.gif",
  },
  {
    number: "814",
    category: "advanced",
    price: 8.0,
    image: "advanced-814.gif",
  },
  {
    number: "816",
    category: "advanced",
    price: 8.0,
    image: "advanced-816.jpg",
  },
  {
    number: "818",
    category: "advanced",
    price: 8.0,
    image: "advanced-818.gif",
  },
  {
    number: "820",
    category: "advanced",
    price: 8.0,
    image: "advanced-820.gif",
  },
  {
    number: "844",
    category: "advanced",
    price: 8.0,
    image: "advanced-844.gif",
  },
  {
    number: "856",
    category: "advanced",
    price: 10.0,
    image: "advanced-856.jpg",
  },
  {
    number: "861",
    category: "advanced",
    price: 16.0,
    image: "advanced-861.jpg",
  },
  {
    number: "869",
    category: "advanced",
    price: 10.0,
    image: "advanced-869.gif",
  },
  {
    number: "870",
    category: "advanced",
    price: 10.0,
    image: "advanced-870.jpg",
  },
  {
    number: "873",
    category: "advanced",
    price: 10.0,
    image: "advanced-873.jpg",
  },
  {
    number: "875",
    category: "advanced",
    price: 8.0,
    image: "advanced-875.gif",
  },
  {
    number: "876",
    category: "advanced",
    price: 8.0,
    image: "advanced-876.gif",
  },
  {
    number: "878",
    category: "advanced",
    price: 10.0,
    image: "advanced-878.gif",
  },
  {
    number: "882",
    category: "advanced",
    price: 10.0,
    image: "advanced-882.gif",
  },
  {
    number: "885",
    category: "advanced",
    price: 8.0,
    image: "advanced-885.gif",
  },
  {
    number: "888",
    category: "advanced",
    price: 8.0,
    image: "advanced-888.gif",
  },
  {
    number: "889",
    category: "advanced",
    price: 8.0,
    image: "advanced-889.gif",
  },
  {
    number: "890",
    category: "advanced",
    price: 8.0,
    image: "advanced-890.gif",
  },
  {
    number: "891",
    category: "advanced",
    price: 8.0,
    image: "advanced-891.gif",
  },
  {
    number: "892",
    category: "advanced",
    price: 8.0,
    image: "advanced-892.gif",
  },
  {
    number: "893",
    category: "advanced",
    price: 8.0,
    image: "advanced-893.gif",
  },
  {
    number: "894",
    category: "advanced",
    price: 16.0,
    image: "advanced-894.jpg",
  },
  {
    number: "105",
    category: "mirrors-and-frames",
    price: 8.0,
    image: "mirrors-frames-105.gif",
  },
  {
    number: "109",
    category: "mirrors-and-frames",
    price: 8.0,
    image: "mirrors-frames-109.gif",
  },
  {
    number: "111",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-111.jpg",
  },
  {
    number: "120",
    category: "mirrors-and-frames",
    price: 8.0,
    image: "mirrors-frames-120.gif",
  },
  {
    number: "149",
    category: "mirrors-and-frames",
    price: 8.0,
    image: "mirrors-frames-149.gif",
  },
  {
    number: "302",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-302.gif",
  },
  {
    number: "321",
    category: "mirrors-and-frames",
    price: 8.0,
    image: "mirrors-frames-321.gif",
  },
  {
    number: "403",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-403.gif",
  },
  {
    number: "404",
    category: "mirrors-and-frames",
    price: 10.0,
    image: "mirrors-frames-404.gif",
  },
  {
    number: "409",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-409.gif",
  },
  {
    number: "478",
    category: "mirrors-and-frames",
    price: 8.0,
    image: "mirrors-frames-478.gif",
  },
  {
    number: "702",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-702.gif",
  },
  {
    number: "722",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-722.gif",
  },
  {
    number: "737",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-737.gif",
  },
  {
    number: "782",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-782.gif",
  },
  {
    number: "783",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-783.gif",
  },
  {
    number: "784",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-784.gif",
  },
  {
    number: "785",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-785.gif",
  },
  {
    number: "787",
    category: "mirrors-and-frames",
    price: 6.0,
    image: "mirrors-frames-787.gif",
  },
];

const numericCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return patterns
    .filter((p) => p.category === category)
    .slice()
    .sort((a, b) => numericCollator.compare(a.number, b.number));
}

export function getPatternCategoryLabel(slug: PatternCategory): string {
  return PATTERN_CATEGORIES.find((c) => c.slug === slug)!.label;
}

export function patternImageUrl(pattern: Pattern): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/patterns/${pattern.category}/${pattern.image}`;
}

export function patternAlt(pattern: Pattern): string {
  return (
    pattern.alt ??
    `${getPatternCategoryLabel(pattern.category)} pattern #${pattern.number}`
  );
}
