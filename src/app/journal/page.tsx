import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { JOURNAL_POSTS } from "@/lib/data/journal";
import { LeafIcon } from "@/components/icons";

export default function JournalPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        tag="Journal"
        title="From the workshop"
        subtitle="Short notes on how the project works, what goes into each piece, and where it's headed."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {JOURNAL_POSTS.map((post, i) => (
          <article
            key={post.title}
            className={`glass rounded-biophilic p-8 ${i === 0 ? "md:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tea text-white">
                <LeafIcon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-tea">
                {post.tag}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-medium text-leaf-deep">{post.title}</h2>
            <p className="mt-2 text-sm font-medium text-stone">{post.excerpt}</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-moss">
              {post.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
