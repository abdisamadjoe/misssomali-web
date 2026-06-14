"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";

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

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback blogs if not found in database (so the fallback links work out-of-the-box!)
  const fallbackBlogs: Record<string, BlogData> = {
    "celebrating-somali-heritage": {
      id: "fallback-1",
      title: "How Miss Somali celebrates and empowers Somali cultural heritage",
      slug: "celebrating-somali-heritage",
      excerpt: "Celebrating traditional arts, values, and leadership paths across the global diaspora.",
      content: `
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Miss Somali is a platform designed to celebrate and elevate the rich cultural heritage of the Somali people, highlighting key traditions and modern leadership. Our delegates represent communities from Canada, the United Kingdom, the United States, and across the Somali peninsula.</p>
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Culture is at the heart of our pageant. Contestants present traditional attire, recite poetry (gabay), and share regional dances. This ensures that younger generations remain connected to their ancestral values while building paths toward modern global influence.</p>
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Beyond the aesthetics, the competition is an educational experience. Through workshops and group discussions, delegates share insights on language preservation, community integration, and youth mentorship, crafting active leadership platforms that persist long after coronation night.</p>
      `,
      coverImage: "/images/about1.webp",
      author: "Organization",
      publishedAt: "2026-06-12T10:00:00.000Z",
      createdAt: "2026-06-12T10:00:00.000Z"
    },
    "leadership-bootcamp-behind-scenes": {
      id: "fallback-2",
      title: "Behind the scenes of the leadership and public speaking bootcamp",
      slug: "leadership-bootcamp-behind-scenes",
      excerpt: "A deep dive into the intensive training workshops preparing delegates for the global stage.",
      content: `
        <p class="mb-6 text-lg leading-relaxed text-slate-700">The Miss Somali Leadership Bootcamp is a core pillar of our program. It prepares contestants for public advocacy, communication, and social impact projects.</p>
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Over a two-week intensive training program, delegates work with professional speaking coaches, public policy experts, and community leaders. They practice delivering speeches, managing press conferences, and formulating project proposals targeting healthcare, education, and women's empowerment initiatives.</p>
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Our bootcamp doesn't just prepare candidates for a pageant stage; it builds fundamental professional and leadership skills that empower them to succeed in corporate boardrooms, public services, and community organizing across the globe.</p>
      `,
      coverImage: "/images/about2.webp",
      author: "Bootcamp Team",
      publishedAt: "2026-05-28T09:00:00.000Z",
      createdAt: "2026-05-28T09:00:00.000Z"
    },
    "preparing-to-represent-community": {
      id: "fallback-3",
      title: "What your journey looks like: preparing to represent your community",
      slug: "preparing-to-represent-community",
      excerpt: "Contestants share their motivation, personal growth, and goals for Miss Somali 2026.",
      content: `
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Representing one's community is both an honor and a profound responsibility. Contestants share the stories of their journey, detailing the motivation and values driving them to the stage.</p>
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Each delegate comes with a vision. For some, it is establishing educational scholarships for young girls; for others, it is creating health awareness networks or championing cultural arts programs. The journey requires dedication, resilience, and a willingness to stand up and speak on behalf of others.</p>
        <p class="mb-6 text-lg leading-relaxed text-slate-700">Follow the path of these incredible leaders as they prepare for coronation night, showcasing the beauty of Somali leadership to millions of viewers worldwide.</p>
      `,
      coverImage: "/images/about3.webp",
      author: "Media Press",
      publishedAt: "2026-05-15T08:00:00.000Z",
      createdAt: "2026-05-15T08:00:00.000Z"
    }
  };

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setBlog(data);
        } else if (fallbackBlogs[slug]) {
          setBlog(fallbackBlogs[slug]);
        }
      })
      .catch((err) => {
        console.error("Error fetching blog details:", err);
        if (fallbackBlogs[slug]) {
          setBlog(fallbackBlogs[slug]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // Calculate dynamic reading time based on content length
  const calculateReadingTime = (content: string): number => {
    if (!content) return 3;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-slate-200 rounded mb-4"></div>
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] px-6 text-center">
          <h1 className="text-3xl font-bold text-[#071E4A] mb-4">Blog Post Not Found</h1>
          <p className="text-slate-500 mb-8 max-w-md">The article you are looking for does not exist or has been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0B2D6B] hover:bg-[#0D3A8A] text-white px-6 py-3 rounded-full font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const displayDate = blog.publishedAt 
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });

  const readingTime = calculateReadingTime(blog.content);

  return (
    <>
      <Navbar />
      
      <main className="flex-1 bg-[#FFFFFF] pt-32 pb-24">
        <article className="max-w-4xl mx-auto px-6">
          
          {/* Back Navigation Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B2D6B] text-sm font-semibold mb-8 group transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Article Header */}
          <header className="mb-10 text-left">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-800 text-[11px] font-semibold uppercase tracking-wider mb-6">
              STORIES & INSIGHTS
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#071E4A] tracking-tight leading-[1.15] mb-6">
              {blog.title}
            </h1>

            {/* Author and Date metadata */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-500 text-sm font-medium border-b border-slate-100 pb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>By {blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{displayDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </header>

          {/* Landscape Cover Image */}
          <div className="relative aspect-[16/9] w-full rounded-[24px] overflow-hidden bg-slate-100 mb-12 shadow-sm border border-slate-100">
            <Image
              src={blog.coverImage || "/images/about1.webp"}
              alt={blog.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* HTML Article Body */}
          <div 
            className="prose prose-slate max-w-none prose-lg text-slate-850"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

        </article>
      </main>

      <Footer />
    </>
  );
}
