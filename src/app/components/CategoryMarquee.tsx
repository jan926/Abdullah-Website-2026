import { memo, useMemo } from "react";
import { Link } from "react-router";
import { getCategoryPath } from "../../lib/categoryStyles";

type CategoryItem = {
  name: string;
  color: string;
  icon: string;
};

type Props = {
  categories: CategoryItem[];
};

export const CategoryMarquee = memo(function CategoryMarquee({ categories }: Props) {
  const items = useMemo(
    () => categories.filter((c) => c.name && c.name !== "All"),
    [categories]
  );

  if (items.length === 0) return null;

  const track = [...items, ...items];

  return (
    <section className="category-marquee-section py-8 bg-[var(--card)] overflow-hidden relative">
      <div className="category-marquee-fade pointer-events-none" aria-hidden />
      <div className="category-marquee-viewport">
        <div className="category-marquee-track">
          {track.map((cat, idx) => (
            <Link
              key={`${cat.name}-${idx}`}
              to={getCategoryPath(cat.name)}
              className={`category-marquee-chip ${cat.color}`}
            >
              <span className="text-lg" aria-hidden>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});
