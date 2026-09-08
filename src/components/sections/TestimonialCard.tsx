import Link from "next/link";
import { getPlan } from "@/data/plans";
import type { Testimonial } from "@/data/testimonials";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-accent" aria-label={`5段階中${rating}`}>
      {"★".repeat(rating)}
      <span className="text-muted">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const plan = getPlan(testimonial.plan);
  return (
    <figure className="cosmic-panel flex h-full flex-col rounded-lg p-6">
      <div className="flex items-center justify-between gap-2">
        <Stars rating={testimonial.rating} />
        {plan && (
          <Link
            href={`/plans/${plan.slug}`}
            className="rounded-md border border-line bg-mist px-2.5 py-0.5 text-xs text-accent hover:border-line hover:text-accent"
          >
            {plan.name}
          </Link>
        )}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
        {testimonial.body}
      </blockquote>
      <figcaption className="mt-5 text-xs text-muted">
        {testimonial.name}・{testimonial.area}
      </figcaption>
    </figure>
  );
}
