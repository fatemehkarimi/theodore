import { ArrowUpRight, BookOpenText } from 'lucide-react';

const articles = [
  {
    type: 'Practical guide',
    date: 'July 10, 2026',
    dateTime: '2026-07-10',
    title: 'How to Render Emojis as Custom Images in a React Text Input',
    description:
      'Build a custom emoji input with Theodore, wire up your own image assets, and connect an emoji picker in a real React example.',
    image:
      'https://cdn-images-1.medium.com/max/1024/1*uOep7OclP3nN5DaTvMm3Eg.png',
    href: 'https://medium.com/@fatemehkarimi.001101/how-to-render-emojis-as-custom-images-in-a-react-text-input-7a44524efe9a',
    tone: 'guide',
  },
  {
    type: 'Story & architecture',
    date: 'February 27, 2026',
    dateTime: '2026-02-27',
    title:
      'Introducing theodore-js, a React library to display your custom emojis',
    description:
      'Explore the story behind Theodore and the content, selection, and history architecture that makes its editing model work.',
    image:
      'https://cdn-images-1.medium.com/max/1024/1*H3Y1hwDtT_IMpIp38rbplA.png',
    href: 'https://medium.com/@fatemehkarimi.001101/introducing-theodore-js-a-react-library-to-display-your-custom-emojis-1a7f25a8fc85',
    tone: 'story',
  },
] as const;

export function Articles() {
  return (
    <section
      className="landing-articles py-20"
      aria-labelledby="articles-title"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="landing-articles-heading">
            <div>
              <p className="landing-articles-kicker">
                <BookOpenText aria-hidden="true" /> Theodore journal
              </p>
              <h2 id="articles-title">Behind the editor</h2>
            </div>
            <p>
              Read the ideas, tradeoffs, and practical techniques that shaped
              Theodore—and bring them into your own React inputs.
            </p>
          </div>

          <div className="landing-articles-grid">
            {articles.map((article, index) => (
              <article
                key={article.href}
                className={`landing-article-card landing-article-card--${article.tone}`}
              >
                <a
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${article.title} on Medium`}
                >
                  <div className="landing-article-image">
                    <img src={article.image} alt="" loading="lazy" />
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="landing-article-content">
                    <div className="landing-article-meta">
                      <span>{article.type}</span>
                      <time dateTime={article.dateTime}>{article.date}</time>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>

                    <div className="landing-article-link">
                      Read on Medium
                      <ArrowUpRight aria-hidden="true" />
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
