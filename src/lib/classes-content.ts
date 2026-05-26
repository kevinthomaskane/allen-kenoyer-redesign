// Phase 1 static class catalog, hand-converted from
// content/classes/content.md. Phase 2 replaces this with database-driven
// rendering per ADR-0015 / ADR-0021. The structure here mirrors the data
// shape we'll need then (category, name, fee, description, prereq, classSize)
// so the Phase 1 → Phase 2 transition is mostly swapping the import.
//
// Session dates are intentionally NOT carried over from the legacy site —
// the canonical upcoming-sessions surface is /classes/calendar (Kristin's
// public Google Calendar embed) per ADR-0020. Listing dates here would
// duplicate state that goes stale within weeks.

export type ClassCategory =
  | "stained-glass"
  | "mosaic"
  | "fused-glass"
  | "other";

export type ClassEntry = {
  name: string;
  // Tuition + supplies summary line (e.g., "5 Weeks – $150 + kit + glass").
  fee: string;
  // Image filename in site-images/classes/ (Supabase Storage). Some classes
  // had multiple images on the legacy site; we ship one representative shot.
  image?: string;
  imageAlt?: string;
  description: string;
  prerequisite?: string;
  classSize?: string;
  // Free-text note (registration instructions, "non-refundable", etc.).
  note?: string;
};

export const CATEGORIES: { id: ClassCategory; label: string }[] = [
  { id: "stained-glass", label: "Stained Glass" },
  { id: "mosaic", label: "Mosaic" },
  { id: "fused-glass", label: "Fused Glass" },
  { id: "other", label: "Other" },
];

export const CLASSES: Record<ClassCategory, ClassEntry[]> = {
  "stained-glass": [
    {
      name: "Beginning Copper Foil",
      fee: "5 weeks · $150 + kit + glass",
      image: "classes--img-06-beginning-foil.jpg",
      imageAlt: "Beginning copper foil stained glass class project",
      description:
        "Learn the tools of the trade — glass cutter, pliers, running pliers — and the theory of why glass breaks. Cover scoring, breaking, cutting curves and ovals, then complete a small stained glass window (about 9″ × 14″) using the copper foil method. Several patterns to choose from at the first class.",
      prerequisite:
        "None — for beginners and anyone wanting to sharpen cutting skills.",
      classSize: "Limit 7 students",
      note: "Must purchase a tool kit (class, kit & glass comes to about $350). Grinders and other specialty equipment provided for use in class.",
    },
    {
      name: "Beginning Lead",
      fee: "4 weeks · $100 + kit + glass",
      image: "classes--beglead.jpg",
      imageAlt: "Beginning lead came stained glass class project",
      description:
        "There's more to stained glass than copper foil. Learn lead came techniques: tools, layout, studio setup, safety, came selection, soldering, cementing, and more. Ideal for larger panels and entry doors. Complete a leaded glass panel about 9″ × 14″.",
      prerequisite: "Beginning Copper Foil",
      classSize: "Limit 5 students",
      note: "Must purchase a tool kit (upgrade kit & glass) and cut/grind your glass prior to the first class. Bring all your prepared glass, safety glasses, and cutting tools to the first class.",
    },
    {
      name: "Cutting Class",
      fee: "$35 · by private lesson — call to schedule",
      image: "classes--img-44-cutting-glass.jpg",
      imageAlt: "Hands cutting glass during a cutting class",
      description:
        "Whether you're new to glass or want to improve, this class teaches glass cutting. Especially useful for fusing and mosaic students. We'll demo the latest tools for cutting glass.",
      note: "By appointment.",
    },
    {
      name: "3D Hummingbird",
      fee: "1 session · $45 + supplies",
      image: "classes--img-14-3d-hummingbird.jpg",
      imageAlt: "Colorful 3D hummingbird stained glass piece",
      description:
        "Make a colorful 3-dimensional hummingbird without using the lead bodies our other 3D class uses.",
      prerequisite: "Beginning Copper Foil proficiency",
      note: "You must pre-cut and foil your glass. Bring prepared glass, iron & soldering supplies, pins, white board, paper towels, chemicals, wedgies.",
    },
    {
      name: "3-D Beveled Star",
      fee: "$35 tuition + supplies",
      image: "classes--BevStarCl2a.jpg",
      imageAlt: "3D beveled stained glass star",
      description:
        "A beautiful 3-dimensional star, in clear or colors. A stunning family heirloom piece.",
      prerequisite: "Beginning Foil Class or equivalent",
      classSize: "Limit 7 students",
      note: "Bring prepared glass, iron & soldering supplies, pins, white board, paper towels, chemicals, wedgies.",
    },
    {
      name: "3-D Butter-Flyers",
      fee: "$120 tuition + $10 kit + supplies",
      image: "classes--Butterfly3d.jpg",
      imageAlt: "3D flying butterfly stained glass",
      description:
        "Learn all the tips and techniques for a beautiful 3D Flying Butterfly. Perfect for a patio or yard, equally great inside. 2-session class with required pre-work — pattern & supply list available upon payment of tuition.",
      prerequisite: "Competency in the copper foil technique",
      classSize: "Limit 7 students",
      note: "No cancellations/refunds for this class — check your calendar before signing up. Bring prepared glass, iron & soldering supplies, pins, white board, paper towels, chemicals.",
    },
    {
      name: "Creative Abstracts",
      fee: "2 sessions · $50 + materials",
      image: "classes--CreativeAbstSM.jpg",
      imageAlt: "Creative abstract stained glass artwork",
      description:
        "Bring in your scrap glass, jewels, and oddities that can withstand foiling and soldering, and turn them into works of art using negative space. Surround them in bevels or make a yard-art piece.",
      prerequisite:
        "Beginning Copper Foil or equivalent. Decorative soldering a plus, but not required.",
      classSize: "Limit 7 students",
      note: "Bring your focal piece, iron & soldering supplies, pins, layout blocks, white board, paper towels, chemicals.",
    },
    {
      name: "Box Class",
      fee: "3 weeks · $85 + supplies",
      image: "classes--img-32-box-class.jpg",
      imageAlt: "Stained glass box with hinged lid",
      description:
        "Learn the secrets of a well-made stained glass box, including a simple hinge. Fast-paced — students must be confident in their skills.",
      prerequisite: "Beginning Foil Class",
      note: "Bring your copper foil supply kit, white board, paper towels.",
    },
    {
      name: "Decorative Soldering Techniques",
      fee: "1 session · $35 + $25 kit",
      image: "classes--img-23-decorative-soldering-techniques.jpg",
      imageAlt: "Decorative soldering on stained glass",
      description:
        "Take soldering to the next level — different looks, different solder types, patinas. Kit includes glass, lead, foil, and use of three patinas.",
      prerequisite: "Prior Allen Kenoyer foil class or teacher approval",
      classSize: "Limit 7 students",
      note: "Bring your full copper foil kit. Iron rental $8 if you don't bring your own; $5 chemicals fee if you don't bring yours.",
    },
    {
      name: "Encased in Glass — Butterflies",
      fee: "1 session · $55 + $10 kit",
      image: "classes--EncaseBflyCF.jpg",
      imageAlt: "Butterfly encased in stained glass",
      description:
        "Sandwich items in glass to create a whole new dimension. A 1-session extended class with required pre-work — cut, grind, and foil prior to first class.",
      prerequisite: "Competency in the copper foil technique",
      classSize: "Limit 7 students",
      note: "You're responsible for the item to encase (dried flower, photo, etc). Bring prepared glass, iron & soldering supplies, white board, paper towels, chemicals.",
    },
    {
      name: "Flat Panel Lamp",
      fee: "4 weeks · $120 + glass & supplies",
      image: "classes--img-22-flat-panel-lamp.jpg",
      imageAlt: "Flat panel stained glass lamp",
      description:
        "A great course for those who've completed a beginner course or want to do their first lamp. Fast-moving with lots of homework. You must register, choose your pattern, and order any special base glass two weeks prior to class.",
      prerequisite: "Competency with Beginning Copper Foil or equivalent",
      classSize: "Limited to 4 students",
      note: "Bring your copper foil class kit including cutting tools.",
    },
    {
      name: "Holiday Votive Holder",
      fee: "$35 tuition + $15 supply fee",
      image: "classes--holidayVotive2.jpg",
      imageAlt: "Holiday-themed stained glass votive holder",
      description:
        "Choose from several holiday-themed votive candle holders — haunted house, gingerbread house, cupcake, seashell, holiday tree. Pattern and pre-work instructions provided upon registration.",
      prerequisite: "Beginning Foil Class",
      classSize: "Limit 7 students — pre-work required",
      note: "Bring prepared glass, iron & soldering supplies, pins, white board, paper towels, chemicals, wedgies.",
    },
    {
      name: "Mystical Orbs",
      fee: "2 sessions · $100 + kit + materials",
      image: "classes--MysOrbDay.jpg",
      imageAlt: "Mystical orb stained glass with solar lights",
      description:
        "An 8″ foam-ball-based orb with solar fairy lights. Extra time between classes for prep — lots of homework required.",
      prerequisite:
        "Beginning Copper Foil or equivalent. Decorative soldering a plus, but not required.",
      classSize: "Limit 7 students — no makeup classes",
      note: "Pre-work required. Pickup instructions when you sign up. Bring prepared glass globs, foil supplies, iron & soldering supplies, white board, paper towels, chemicals.",
    },
    {
      name: "Shadow Art",
      fee: "2 sessions, 3 weeks · $75 + glass & supplies",
      image: "classes--img-25-shadow-art.jpg",
      imageAlt: "Shadow art piece on glass billets",
      description:
        "Create a masterpiece using decorative soldering techniques on glass billets. The depth of this type of glass produces an amazing 2-sided 3-D effect. Glass billets must be ordered at least 3 weeks in advance ($55–$75 each).",
      prerequisite:
        "Basic soldering (Beg Foil or private lesson). Decorative soldering helpful, but not required.",
      classSize: "Limit 5 students",
      note: "Non-transferable, non-refundable class — no exceptions. Bring all copper foil supplies, iron & soldering supplies, white board, paper towels, chemicals.",
    },
    {
      name: "SpiderWebs",
      fee: "$35 tuition + $10 supply fee",
      image: "classes--65d185a1-d545-4ec7-a06c-b850ad9a01f9.jpg",
      imageAlt: "Stained glass spiderweb made from scrap glass and globs",
      description:
        "Make a fun spiderweb using scrap clear glass and globs — just in time for Halloween.",
      prerequisite: "Beginning Copper Foil proficiency",
      classSize: "Limit 7 students",
      note: "Pre-work required — pick up pattern when you sign up; come to class with glass cut, ground, and foiled.",
    },
    {
      name: "Sunflower Yard Art",
      fee: "$75 class fee + $55 kit fee + materials",
      image: "classes--img-37-sunflower-yard-art.jpg",
      imageAlt: "Large stained glass sunflower yard art on a copper pole",
      description:
        "A full-size sunflower (over 6 feet tall) on a copper pole. Pick up your supply list and instruction sheet, then show up with all your pre-tinned pieces and soldering supplies.",
      prerequisite: "Beginning Foil Class or equivalent",
      classSize: "Limited to 6 students — register quickly",
      note: "Bring prepared glass, iron & soldering supplies, white board, paper towels, chemicals.",
    },
    {
      name: 'Treasures In Stained Glass: "Encasing Memories" Frames',
      fee: "2 weeks · $65 + supplies",
      image: "classes--img-29-treasures-in-stained-glass-encasing-memories.jpg",
      imageAlt: "Stained glass frame encasing a photograph",
      description:
        "Have something of great value — photos, postcards, letters, cards? Learn how to encase them in stained glass so you can display them and pass them on for generations.",
      prerequisite: "Competency in Copper Foil",
      note: "Bring the item to encase, your copper foil kit, iron & soldering supplies, white board, paper towels, chemicals.",
    },
    {
      name: "Wind Spinners",
      fee: "4 hours · $45 + materials",
      image: "classes--img-13-wind-spinners.jpg",
      imageAlt: "Stained glass wind spinner with bevels",
      description:
        "Make stunning outdoor wind spinners using your favorite glass with light-catching bevels. Project based on the book 40 Great Stained Glass Projects by Michael Johnston.",
      prerequisite: "Competency in copper foil",
      classSize: "Limit 7 students",
      note: "Bring prepared glass, iron & soldering supplies, pins, white board, paper towels, chemicals.",
    },
  ],
  mosaic: [
    {
      name: "Mosaic Madness — Glass on Glass",
      fee: "2 sessions · $55 + supplies",
      image: "classes--img-09-mosaic-madness.jpg",
      imageAlt: "Glass-on-glass mosaic in a picture frame",
      description:
        "Direct mosaics using scrap glass, glass nuggets, glass tiles, glue, and grout. Scrap glass is included; all other items are student-provided if wanted.",
      prerequisite: "None — you will not finish in class",
      classSize: "Limit 7 students",
      note: "Bring an 8×10 picture frame (not a document frame), safety glasses, baggies, paper towels, and a box for your cut pieces. If you own mosaic nippers, bring them.",
    },
    {
      name: "Mosaic Glass On Wood",
      fee: "2 sessions · $55 + supplies",
      image: "classes--img-10-mosaic-glass-on-wood.jpg",
      imageAlt: "Glass mosaic on a wooden tabletop or wall hanging",
      description:
        "Make a beautiful 16″ square mosaic table or wall hanging — even if you've never done mosaics before. Scrap glass is included; $9 for a 16″ plywood, or bring your own.",
      prerequisite:
        "None — you will not finish in class. Glass cutting a plus, not required.",
      classSize: "Limit 7 students",
      note: "Bring a box for glass, baggies, paper towels, safety glasses. If you own mosaic nippers, bring them.",
    },
    {
      name: "Grouting Session",
      fee: "Included with Mosaic Madness or Mosaic Glass on Wood",
      description:
        "The grouting session for students completing Mosaic Madness or the Mosaic Glass on Wood project. Sign up at least 1 week prior. Want to grout future projects at our shop? Drop in for $15.",
      prerequisite: "First session of Mosaic Madness or Mosaic Glass on Wood",
      note: "Wear clothes you can get messy in. Bring thick dish-washing gloves (not nitrile), q-tips, a wood stylus, and paper towels. Your project must be dried at least 3 days.",
    },
  ],
  "fused-glass": [
    {
      name: "First Friday Fusing Nights",
      fee: "$25 tuition + glass",
      image: "classes--img-02-first-friday-fusing-nights.jpg",
      imageAlt: "Open fusing studio night at Allen Kenoyer Glass",
      description:
        'An "Open Idea" night for fusers and the fusing-curious. Create your own project; new students will be guided. Includes one firing with 6×6 kiln space (additional space and glass extra). Make it a date night or girls night out.',
      prerequisite: "None — glass cutting a plus",
      classSize: "Limit 7 students at a time. $25 holds your spot.",
      note: "Bring safety glasses and mosaic nippers if you own them. Project will be fired and ready the next week for pickup.",
    },
    {
      name: "Dot Art",
      fee: "$50 + $15 kit fee",
      image: "classes--DotArt2.jpg",
      imageAlt: "Dot Art enamel-painted glass tiles",
      description:
        "Introduces Colors For Earth enamel paints. Using dotting tools, learn basic pointillism and make two 4″ tiles, fired onto black or white bases. For an additional charge they can be slumped into sushi dishes. Additional tiles in class: $15 each. Done in 96 COE glass.",
      prerequisite: "None",
      classSize: "Limit 8 students",
      note: "Bring small simple designs if you'd like.",
    },
    {
      name: "Dot Art 2",
      fee: "Intermediate",
      image: "classes--owlDApic.jpg",
      imageAlt: "Owl Dot Art piece in fused glass",
      description:
        "Builds on the Dot Art class using Colors For Earth enamel paints. Continue your pointillism work on larger pieces of your choice. Includes one firing for up to 8″ × 8″.",
      prerequisite: "Dot Art class",
      classSize: "Limit 8 students",
    },
    {
      name: "Fused Hearts",
      fee: "$65",
      image: "classes--9ofHearts1.jpg",
      imageAlt: "Fused glass hearts made from scrap glass",
      description:
        "Create 12 unique cast glass hearts using lots of scrap glass. Great for a girls night or date night.",
      prerequisite: "None",
      classSize: "Limit 8 students",
      note: "Bring mosaic nippers if you have them, safety glasses.",
    },
    {
      name: "Coral Sea Bowl Mini",
      fee: "$55",
      image: "classes--CoralBowls.jpg",
      imageAlt: "Coral-sea-themed fused glass bowl",
      description:
        "Make a coral sea bowl — fee includes class, two firings, and a $10 glass credit (covers most colors; hot colors may be more).",
      prerequisite: "None",
      classSize: "Limit 7 students",
      note: "Bring safety glasses, paper towels, and mosaic nippers if you have them.",
    },
    {
      name: "Doodle Plates / Frit Painting",
      fee: "$40 + $15 kit",
      image: "classes--img-42-doodle-plates-frit-painting.jpg",
      imageAlt: "Fused glass plate decorated with frit",
      description:
        "Ever wonder how to use glass frit and paint? Students make a 6″ × 6″ plate using frits and glass paints. All items included plus one firing.",
      prerequisite: "None",
      classSize: "Limit 7 students",
    },
    {
      name: "Easter Eggs / Relief Fusing",
      fee: "$35 + glass",
      image: "classes--P1030721.jpg",
      imageAlt: "Relief-fused glass with paper-cut details",
      description:
        "Use thin fiber paper, punches, and scissors to get a relief effect in fused glass. You don't have to make Easter Eggs, but they're a lot of fun. Fee includes firing for up to a 6×6 panel, thin fiber paper, and use of our punches.",
      prerequisite: "None — cutting helpful",
      classSize: "Limit 7 students",
    },
    {
      name: "Fused Fish Frenzy",
      fee: "2 weeks · $55 tuition + $20 kit",
      image: "classes--img-17-fused-fish-frenzy.jpg",
      imageAlt: "Whimsical fused glass flying fish",
      description:
        "Fun, flying fish — a welcome addition for any ocean lover. Firing and wiring included; driftwood not included. Kit covers everything needed for 3 fish. Dichroic glass extra.",
      prerequisite: "None",
      classSize: "Limit 7 students",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Fused Jellyfish",
      fee: "2 sessions · $65 + materials",
      image: "classes--img-28-fused-jellyfish.jpg",
      imageAlt: "Hanging fused glass jellyfish",
      description:
        "Beautiful hanging jellyfish — also makes an amazing gift. Cost includes all firings, stringing wire, crimping beads, and disk. Glass not included; tuition must be prepaid to hold your spot.",
      classSize: "Limit 7 students",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Fused Mushrooms",
      fee: "$55 + glass",
      image: "classes--img-31-fused-mushrooms.jpg",
      imageAlt: "Fused glass mushrooms",
      description:
        'Two styles of fused mushrooms — the slurry technique and the "hammertime". Class includes everything for the slurry mushroom and all the frit and firings. For the hammer technique, students purchase the glass. Firings included.',
      prerequisite: "None",
      classSize: "Limit 5 students",
      note: "Bring safety glasses if you have them.",
    },
    {
      name: "Texture Molds",
      fee: "1 week · $55 + glass",
      image: "classes--img-18-texture-molds.jpg",
      imageAlt: "Frit-textured fused glass piece on a mold",
      description:
        "We have a variety of texture molds from peacocks to holidays. First come, first choice. Includes tuition, 1 firing, and frit. Glass fee for base glass depends on mold size. Second firing $10.",
      prerequisite: "None",
      classSize: "Limit 7 students",
    },
    {
      name: "Fused Glass Wave",
      fee: "1 week · $40 tuition + glass fee",
      image: "classes--img-15-fused-glass-wave.jpg",
      imageAlt: "Fused glass wave sculpture",
      description:
        "An approximately 8″ wave piece. Firing included; glass extra. Stands available for purchase.",
      prerequisite: "None",
      classSize: "Limit 7 students",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Fused Wind Chimes",
      fee: "3 weeks · $85 + glass",
      image: "classes--img-27-fused-wind-chimes.jpg",
      imageAlt: "Fused glass wind chimes",
      description:
        "Choose from several designs. Price includes tuition, high-temp wire, beading wire, crimps, and one firing. You bring the hanging support (driftwood, corbel, decorative beads, etc).",
      prerequisite: "Glass cutting skills required",
      classSize: "Limit 7 students",
      note: "Bring safety glasses, paper towels, cutting tools.",
    },
    {
      name: "Crystal Christmas Trees",
      fee: "$35",
      image: "classes--img-48-crystal-christmas-trees.jpg",
      imageAlt: "Crystal Christmas tree fused glass light catcher",
      description:
        "Make a stunning holiday light catcher using scrap glass and frit. Cost includes tuition and supplies; dichroic glass extra.",
      classSize: "Limit 7 students per session",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Fairy Forest",
      fee: "$35 + $50 kit",
      image: "classes--FairyTree-1.jpg",
      imageAlt: "Whimsical fairy forest fused glass piece",
      description:
        "A whimsical art piece in fused glass. Choose from two different sizes.",
      prerequisite: "None",
      classSize: "Limit 7 students",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Yard Stake",
      fee: "$45 + $55 kit + specialty glass",
      image: "classes--YardStake1a.jpg",
      imageAlt: "Fused glass yard stake garden art",
      description:
        "Garden stakes about 3″ × 24″ holding a fused piece of glass. Create a patchwork of color or a name panel. Kit includes stand and $15 in glass credit (apply to other glass choices if you prefer). Dichroic glass extra.",
      prerequisite: "None — glass cutting helpful but not required",
      classSize: "Limit 7 students",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Fused Sand Art",
      fee: "$30 + $25 kit fee",
      image: "classes--SandArtKK.jpg",
      imageAlt: "Vertical sand art in fused glass",
      description:
        "An interesting vertical sand-art piece based on the technique developed by the late David Alcala. Choose an 8″ square or 7″ round piece. Kit price includes base glass, fine frit, and 1 firing.",
      classSize: "Limit 7 students per session",
    },
    {
      name: "Fused Glass Menorah",
      fee: "$65 + glass & supplies",
      image: "classes--MenorahWS.jpg",
      imageAlt: "Fused glass menorah",
      description:
        "Design and make a beautiful menorah — a family heirloom to pass on for generations.",
      classSize: "Limit 7 students per session",
      note: "Bring safety glasses, paper towels, cutting tools, and mosaic nippers if you have them.",
    },
    {
      name: "Fused Ornaments",
      fee: "$15 per ornament · 3 for $40",
      image: "classes--img-47-fused-ornaments.jpg",
      imageAlt: 'Fused glass holiday "cookies" and ornaments',
      description:
        'Think glass "Christmas cookies." Drop in, decorate, and leave your ornaments with us to fire. Kids over 8 are allowed to enroll with a parent. All ornaments are done in Bullseye glass.',
      classSize: "Limit 8 students per session block",
      note: "Bring safety glasses and mosaic nippers if you have them.",
    },
    {
      name: "Introduction to Fusing Glass",
      fee: "$110",
      image: "classes--img-01-jim-the-kiln-guy.jpg",
      imageAlt: "Introduction to fusing glass — kiln demo",
      description:
        "Curious about fusing? Introduction to fused glass and how a kiln works. 2½ hours, all supplies included. Assemble 3 small projects that will be fired and ready for pickup in a few days.",
      prerequisite: "None",
    },
    {
      name: "Lecture/Q&A on Kiln Ownership",
      fee: "$45",
      description:
        "Great for those who own a kiln or are thinking about it. Jim discusses kilns, ownership, and answers your questions.",
    },
    {
      name: "Dichroic Disco",
      fee: "$65",
      image: "classes--EtchedDichro.jpg",
      imageAlt: "Etched dichroic glass jewelry piece",
      description:
        "The do's and don'ts of working with dichroic glass. Make a small jewelry piece, try the acid etch process, and make Angel Tears. Drilling holes in glass and adding bails will be demonstrated. Includes supplies for in-class projects; additional dichroic glass available for purchase.",
    },
    {
      name: "Glass & Gravity",
      fee: "$65",
      image: "classes--VitroPull.jpg",
      imageAlt: "Vitrigraph kiln pulling glass",
      description:
        "Manipulate fused glass pieces using molds and other materials. See how a Vitrigraph kiln works and pull some glass yourself. You'll make a slumped item to pick up in a few days.",
    },
  ],
  other: [
    {
      name: "Intermediate Workshop",
      fee: "5 weeks · $100",
      description:
        "Not a class — a workshop. Work on more advanced projects under talented supervision and enjoy spending time with other glassy folk. Projects can include foil, lead, fusing, mosaic, or novelty items such as boxes and lamps. Each participant has approximately 8 square feet of space (4′ × 2′).",
      prerequisite:
        "Previous experience in the technique you're using (from us or prove competency prior to enrollment). You are required to own and use your own tools.",
      classSize: "Limit 8 students per session",
      note: "No make-up sessions. Tuition is not pro-rated for missed classes. If you can't commit to 5 weeks and we have space, you can call to sign up each week for $25 per week.",
    },
    {
      name: "Bottle Chimes",
      fee: "$55+",
      image: "classes--img-33-bottle-chimes.jpg",
      imageAlt: "Bottle wind chimes made from up-cycled bottles",
      description:
        "Up-cycle bottle and glass to make amazing chimes. Bring 2 or more bottles (clean, dry, and all labels removed) and we'll help cut them. You'll make 1 chime during class.",
      prerequisite: "None — cutting experience helpful but not required",
    },
    {
      name: "Wire Wrapping — Tree of Life",
      fee: "$35 + teacher supply fee",
      image: "classes--TreePalm2.jpg",
      imageAlt: "Wire-wrapped tree-of-life pendant with gemstone",
      description:
        "Guest teacher Julie LaPointe returns to teach wire weaving — create a stunning pendant using copper or sterling silver wire and gemstones. Choose from a Tree of Life or Palm Tree. Teacher brings a variety of items for use or purchase.",
      prerequisite: "None — great for any skill level",
      classSize: "Limit 7 students",
    },
  ],
};

// Workshop policies block, lifted from the legacy content.
export const WORKSHOP_POLICIES = {
  intro:
    "The shop is available for your use during certain times for a fee. Workshops include use of our cutting systems, limited grinder use (ask if you need it for your whole project), and luster brush. Workshops do not include chemicals or supplies — see fees below.",
  tiers: [
    {
      label: "Workshop",
      price: "$15 / 2½ hours",
      description:
        "A little help to keep you on track for your own project, but you basically work on your own.",
    },
    {
      label: "Workshop Plus",
      price: "$20 / 2½ hours",
      description:
        "A little extra instruction and help as you need it. You still basically work on your own.",
    },
    {
      label: "Class Makeup",
      price: "$30+ / 2½ hours",
      description:
        "If you must miss an important class, we'll help you get back on track. Some classes cannot be made up. If catching up only, workshop rates apply.",
    },
    {
      label: "Private Instruction",
      price: "$65 / hour / person",
      description:
        "By appointment only — limited availability on weekdays. Must be scheduled ahead of time. One-on-one focused instruction.",
    },
  ],
  hours: [
    "Tuesday nights 6:00pm – 8:30pm — see other classes for intermediate workshops.",
    "Weekdays and Saturdays — as space allows, call first to see what's available.",
  ],
  fees: [
    "Chemicals $5 — if you need to use our chemicals during workshop.",
    "Soldering iron rental $8 — if you need to use one of ours.",
    "Grinder rental $10 — must buy your own bit & sponge.",
  ],
  safety:
    "Closed-toe shoes and eye protection are required in all classes and workshops. Long pants are suggested, especially when cutting and soldering.",
};
