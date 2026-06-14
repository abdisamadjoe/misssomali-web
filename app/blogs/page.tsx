"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock } from "lucide-react";

interface BlogData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        if (data && data.length > 0) {
          setBlogs(data);
        }
      })
      .catch((err) => console.error("Error fetching blogs:", err))
      .finally(() => setLoading(false));
  }, []);

  // Calculate dynamic reading time based on content length
  const calculateReadingTime = (content: string): number => {
    if (!content) return 3;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Fallback blogs if database is empty
  const fallbackBlogs: BlogData[] = [
    {
      id: "fallback-1",
      title: "How Miss Somali celebrates and empowers Somali cultural heritage",
      slug: "celebrating-somali-heritage",
      excerpt: "Celebrating traditional arts, values, and leadership paths across the global diaspora.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel sodales ante.",
      coverImage: "/images/about1.webp",
      author: "Organization",
      publishedAt: "2026-06-12T10:00:00.000Z",
      createdAt: "2026-06-12T10:00:00.000Z"
    },
    {
      id: "fallback-2",
      title: "Behind the scenes of the leadership and public speaking bootcamp",
      slug: "leadership-bootcamp-behind-scenes",
      excerpt: "A deep dive into the intensive training workshops preparing delegates for the global stage.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel sodales ante.",
      coverImage: "/images/about2.webp",
      author: "Bootcamp Team",
      publishedAt: "2026-05-28T09:00:00.000Z",
      createdAt: "2026-05-28T09:00:00.000Z"
    },
    {
      id: "fallback-3",
      title: "What your journey looks like: preparing to represent your community",
      slug: "preparing-to-represent-community",
      excerpt: "Contestants share their motivation, personal growth, and goals for Miss Somali 2026.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel sodales ante.",
      coverImage: "/images/about3.webp",
      author: "Media Press",
      publishedAt: "2026-05-15T08:00:00.000Z",
      createdAt: "2026-05-15T08:00:00.000Z"
    }
  ];

  const displayedBlogs = blogs.length > 0 ? blogs : fallbackBlogs;

  return (
    <>
      <Navbar />
      
      <main className="flex-1 bg-[#FFFFFF] pt-32 pb-24 min-h-[85vh]">
        <div className="grid-container">
          
          {/* Page Header */}
          <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 text-[12px] font-medium uppercase tracking-wider mb-6">
              STORIES & JOURNAL
            </div>
            
            <h1 className="text-[36px] sm:text-[44px] md:text-[56px] font-semibold text-[#071E4A] tracking-tight leading-[1.1] mb-6">
              Blogs & News
            </h1>
            
            <div className="w-16 h-[2px] bg-[#0B2D6B] mb-6 rounded-full" />
            
            <p className="text-slate-500 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
              Explore our collection of articles highlighting contestant spotlights, event milestones, leadership workshops, and celebrations of Somali culture.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0B2D6B]"></div>
            </div>
          ) : (
            /* Card Grid of all blogs */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-y-12">
              {displayedBlogs.map((blog) => {
                const displayDate = blog.publishedAt 
                  ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  : new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });

                const readingTime = calculateReadingTime(blog.content);

                return (
                  <div key={blog.id} className="group flex flex-col h-full cursor-pointer">
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-slate-100 mb-6 shadow-sm border border-slate-100">
                      <Image
                        src={blog.coverImage || "/images/about1.webp"}
                        alt={blog.title}
                        fill
                        sizes="(max-w-768px) 100vw, 30vw"
                        className="object-cover object-center transition-transform duration-750 ease-out group-hover:scale-[1.04]"
                      />
                    </div>

                    {/* Headline */}
                    <h3 className="text-[#071E4A] font-semibold text-xl md:text-[22px] leading-snug tracking-tight mb-4 group-hover:text-[#0B2D6B] transition-colors duration-250">
                      <Link href={`/blogs/${blog.slug}`} className="hover:underline line-clamp-2">
                        {blog.title}
                      </Link>
                    </h3>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 mt-auto text-slate-500 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{displayDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{readingTime} min read</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
